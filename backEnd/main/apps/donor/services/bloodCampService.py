from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.bloodCamp import BloodCamp
from ..models.campRegistration import CampRegistration
from ..models.donationHistory import DonationHistory
from ..models.donorAlert import DonorAlert
from ..models.donorDetails import DonorDetails
from ..serializers.bloodCampSerializer import (
    BloodCampSerializer,
    CampRegistrationSerializer,
)

ROLE_BLOOD_CAMP = "bloodcamp"
ROLE_DOCTOR = "doctor"
ROLE_ADMIN = "admin"


class UpcomingBloodCampsView(ListAPIView):
    """
    GET /api/v1/camps/upcoming/
    Returns a list of upcoming blood camps. Accessible to all authenticated users (Donors).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BloodCampSerializer

    def get_queryset(self):
        return BloodCamp.objects.filter(status="Upcoming")


class LatestPublicBloodCampView(APIView):
    """
    GET /api/v1/camps/public/latest/
    Returns the latest upcoming blood camp for public users.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        latest_camp = (
            BloodCamp.objects.filter(status="Upcoming")
            .order_by("-created_at")
            .first()
        )
        if not latest_camp:
            return Response(None, status=status.HTTP_200_OK)
        serializer = BloodCampSerializer(latest_camp, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrganizerBloodCampView(ListCreateAPIView):
    """
    GET /api/v1/camps/
    POST /api/v1/camps/
    List or create blood camps. Only accessible to 'bloodcamp' role.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BloodCampSerializer

    def get_queryset(self):
        if self.request.user.role != ROLE_BLOOD_CAMP:
            raise PermissionDenied("Only Camp Organizers can manage camps.")
        return BloodCamp.objects.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != ROLE_BLOOD_CAMP:
            raise PermissionDenied("Only Camp Organizers can create camps.")
        serializer.save(organizer=self.request.user)


class RegisterForCampView(APIView):
    """
    POST /api/v1/camps/<id>/register/
    Allows a Donor to request to donate at a specific camp.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != "donor":
            raise PermissionDenied("Only donors can register for camps.")

        camp = get_object_or_404(BloodCamp, pk=pk)
        donor, _ = DonorDetails.objects.get_or_create(user=request.user)

        # Check if already registered
        if CampRegistration.objects.filter(donor=donor, camp=camp).exists():
            return Response({"detail": "Already registered for this camp."}, status=status.HTTP_400_BAD_REQUEST)

        registration = CampRegistration.objects.create(donor=donor, camp=camp)
        return Response(
            CampRegistrationSerializer(registration, context={"request": request}).data,
            status=status.HTTP_201_CREATED
        )


class CampRegistrationsView(ListAPIView):
    """
    GET /api/v1/camps/<id>/registrations/
    Allows Camp Organizers to view registrations for a specific camp they organize.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CampRegistrationSerializer

    def get_queryset(self):
        if self.request.user.role != ROLE_BLOOD_CAMP:
            raise PermissionDenied("Only Camp Organizers can view registrations.")

        camp_id = self.kwargs.get("pk")
        camp = get_object_or_404(BloodCamp, pk=camp_id, organizer=self.request.user)
        return CampRegistration.objects.filter(camp=camp)


def _invalid_transition_response(current_status, expected_states):
    states = ", ".join(expected_states)
    return Response(
        {
            "detail": (
                f"Invalid status transition from '{current_status}'. "
                f"Allowed current status: {states}."
            )
        },
        status=status.HTTP_400_BAD_REQUEST,
    )


def _get_staff_registration(user, pk):
    if user.role == ROLE_ADMIN:
        return get_object_or_404(CampRegistration, pk=pk)
    return get_object_or_404(CampRegistration, pk=pk, camp__organizer=user)


class MarkArrivedCampRegistrationView(APIView):
    """
    POST /api/v1/donor/camps/registrations/<id>/arrive/
    Mark a registered donor as arrived at camp.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in {ROLE_BLOOD_CAMP, ROLE_ADMIN}:
            raise PermissionDenied("Only blood camp staff can mark donor arrival.")

        registration = _get_staff_registration(request.user, pk)
        if registration.status != "registered":
            return _invalid_transition_response(registration.status, ["registered"])

        registration.status = "arrived"
        registration.arrived_at = timezone.now()
        registration.save(update_fields=["status", "arrived_at"])
        return Response({"detail": "Donor marked as arrived."}, status=status.HTTP_200_OK)


class SendToScreeningCampRegistrationView(APIView):
    """
    POST /api/v1/donor/camps/registrations/<id>/screening/
    Move arrived donor to doctor screening queue.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in {ROLE_BLOOD_CAMP, ROLE_ADMIN}:
            raise PermissionDenied("Only blood camp staff can send donor to screening.")

        registration = _get_staff_registration(request.user, pk)
        if registration.status != "arrived":
            return _invalid_transition_response(registration.status, ["arrived"])

        registration.status = "screening"
        registration.save(update_fields=["status"])
        return Response({"detail": "Donor moved to doctor screening queue."}, status=status.HTTP_200_OK)


class ApproveCampRegistrationView(APIView):
    """
    POST /api/v1/camps/registrations/<id>/approve/
    Allows doctors to approve a donor after screening.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in {ROLE_DOCTOR, ROLE_ADMIN}:
            raise PermissionDenied("Only doctors can approve donor screening.")

        registration = get_object_or_404(CampRegistration, pk=pk)
        if registration.status != "screening":
            return _invalid_transition_response(registration.status, ["screening"])

        registration.status = "approved"
        registration.screened_at = timezone.now()
        registration.screened_by = request.user
        registration.rejection_reason = ""
        registration.save(update_fields=["status", "screened_at", "screened_by", "rejection_reason"])

        DonorAlert.objects.create(
            donor=registration.donor,
            message=(
                f"You are approved to donate at '{registration.camp.title}'. "
                "Please proceed to blood collection."
            ),
            alert_type="camp"
        )
        return Response({"detail": "Donor approved for collection."}, status=status.HTTP_200_OK)


class RejectCampRegistrationView(APIView):
    """
    POST /api/v1/camps/registrations/<id>/reject/
    Payload: {"reason": "Hb below threshold"}
    Allows doctors to reject a donor after screening.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in {ROLE_DOCTOR, ROLE_ADMIN}:
            raise PermissionDenied("Only doctors can reject donor screening.")

        reason = (request.data.get("reason") or "").strip()
        if not reason:
            return Response({"detail": "Rejection reason is required."}, status=status.HTTP_400_BAD_REQUEST)

        registration = get_object_or_404(CampRegistration, pk=pk)
        if registration.status != "screening":
            return _invalid_transition_response(registration.status, ["screening"])

        registration.status = "rejected"
        registration.screened_at = timezone.now()
        registration.screened_by = request.user
        registration.rejection_reason = reason
        registration.save(update_fields=["status", "screened_at", "screened_by", "rejection_reason"])

        DonorAlert.objects.create(
            donor=registration.donor,
            message=(
                f"Your donor screening at '{registration.camp.title}' was rejected. "
                f"Reason: {reason}"
            ),
            alert_type="camp"
        )
        return Response({"detail": "Donor rejected with reason."}, status=status.HTTP_200_OK)


class CompleteCampRegistrationView(APIView):
    """
    POST /api/v1/camps/registrations/<id>/donate/
    Allows blood camp staff to mark an approved donor as donated.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in {ROLE_BLOOD_CAMP, ROLE_ADMIN}:
            raise PermissionDenied("Only blood camp staff can complete donation collection.")

        registration = _get_staff_registration(request.user, pk)

        if registration.status != "approved":
            return _invalid_transition_response(registration.status, ["approved"])

        now = timezone.now()

        with transaction.atomic():
            registration.status = "donated"
            registration.collected_at = now
            registration.collected_by = request.user
            registration.save(update_fields=["status", "collected_at", "collected_by"])

            donor = registration.donor
            donor.total_donations += 1
            donor.last_donation_date = now.date()
            donor.save(update_fields=["total_donations", "last_donation_date"])

            DonationHistory.objects.create(
                donor=donor,
                hospital_name=registration.camp.title,
                blood_group=getattr(
                    donor.user,
                    "blood_group",
                    getattr(getattr(donor.user, "profile", None), "blood_group", "Unknown"),
                )
                or "Unknown",
                units=1,
                status="completed",
                donation_date=now.date(),
                notes=f"Donated at {registration.camp.title} ({registration.camp.location})",
            )

            DonorAlert.objects.create(
                donor=donor,
                message=f"Thank you for donating blood at {registration.camp.title}! Your contribution saves lives.",
                alert_type="eligibility",
            )

        return Response({"detail": "Donor marked as donated and history updated."}, status=status.HTTP_200_OK)
