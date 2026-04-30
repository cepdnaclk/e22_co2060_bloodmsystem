from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.bloodCamp import BloodCamp
from ..models.campRegistration import CampRegistration
from ..models.donorDetails import DonorDetails
from ..models.donorAlert import DonorAlert
from ..serializers.bloodCampSerializer import BloodCampSerializer, CampRegistrationSerializer


class UpcomingBloodCampsView(ListAPIView):
    """
    GET /api/v1/camps/upcoming/
    Returns a list of upcoming blood camps. Accessible to all authenticated users (Donors).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BloodCampSerializer

    def get_queryset(self):
        return BloodCamp.objects.filter(status="Upcoming")


class OrganizerBloodCampView(ListCreateAPIView):
    """
    GET /api/v1/camps/
    POST /api/v1/camps/
    List or create blood camps. Only accessible to 'bloodcamp' role.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BloodCampSerializer

    def get_queryset(self):
        if self.request.user.role != "bloodcamp":
            raise PermissionDenied("Only Camp Organizers can manage camps.")
        return BloodCamp.objects.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != "bloodcamp":
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
        if self.request.user.role != "bloodcamp":
            raise PermissionDenied("Only Camp Organizers can view registrations.")

        camp_id = self.kwargs.get("pk")
        camp = get_object_or_404(BloodCamp, pk=camp_id, organizer=self.request.user)
        return CampRegistration.objects.filter(camp=camp)


class ApproveCampRegistrationView(APIView):
    """
    POST /api/v1/camps/registrations/<id>/approve/
    Payload: {"appointment_time": "10:30"}
    Allows Camp Organizers to approve a registration and send an alert to the donor.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != "bloodcamp":
            raise PermissionDenied("Only Camp Organizers can approve registrations.")

        registration = get_object_or_404(CampRegistration, pk=pk, camp__organizer=request.user)
        appointment_time = request.data.get("appointment_time")

        if not appointment_time:
            return Response({"detail": "Appointment time is required."}, status=status.HTTP_400_BAD_REQUEST)

        registration.status = "approved"
        registration.appointment_time = appointment_time
        registration.save()

        # Create an alert for the donor
        message = (
            f"Your registration for '{registration.camp.title}' is approved. "
            f"Please arrive at {registration.camp.location} on {registration.camp.date} at {appointment_time}."
        )
        DonorAlert.objects.create(
            donor=registration.donor,
            message=message,
            alert_type="camp"
        )

        return Response({"detail": "Registration approved and donor notified."})
