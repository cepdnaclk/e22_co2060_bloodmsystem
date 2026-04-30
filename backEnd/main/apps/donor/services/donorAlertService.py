from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated

from ..models.donorAlert import DonorAlert
from ..models.donorDetails import DonorDetails
from ..serializers.donorAlert import DonorAlertSerializer, DonorAlertMarkReadSerializer


class DonorAlertListView(ListAPIView):
    """
    GET /api/v1/donor/alerts/
    Returns all alerts for the authenticated donor, newest first.

    Query params:
        ?unread=true   — only unread alerts
        ?type=urgent   — filter by alert_type
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DonorAlertSerializer

    def get_queryset(self):
        if self.request.user.role != "donor":
            raise PermissionDenied("Only donors can view alerts.")

        donor, _ = DonorDetails.objects.get_or_create(user=self.request.user)

        # Auto-generate eligibility alert if eligible and no recent one exists
        self._auto_generate_eligibility_alert(donor)

        qs = DonorAlert.objects.filter(donor=donor)

        # Optional filters
        unread = self.request.query_params.get("unread")
        if unread and unread.lower() == "true":
            qs = qs.filter(is_read=False)

        alert_type = self.request.query_params.get("type")
        if alert_type:
            qs = qs.filter(alert_type=alert_type)

        return qs

    def _auto_generate_eligibility_alert(self, donor):
        """
        If the donor is eligible to donate and there's no
        eligibility alert in the last 7 days, create one automatically.
        """
        if not donor.is_eligible:
            return

        week_ago = timezone.now() - timedelta(days=7)
        recent_exists = DonorAlert.objects.filter(
            donor=donor,
            alert_type="eligibility",
            created_at__gte=week_ago,
        ).exists()

        if not recent_exists:
            DonorAlert.objects.create(
                donor=donor,
                alert_type="eligibility",
                message="You are eligible to donate blood today! Find a nearby camp or respond to an urgent request.",
            )


class DonorAlertMarkReadView(UpdateAPIView):
    """
    PATCH /api/v1/donor/alerts/<id>/read/
    Marks a single alert as read.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DonorAlertMarkReadSerializer

    def get_queryset(self):
        if self.request.user.role != "donor":
            raise PermissionDenied("Only donors can manage alerts.")

        donor, _ = DonorDetails.objects.get_or_create(user=self.request.user)
        return DonorAlert.objects.filter(donor=donor)
