from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from ..models.donorDetails import DonorDetails
from ..serializers.donorDashboard import DonorDashboardSerializer


class DonorDashboardView(RetrieveAPIView):
    """
    GET /api/v1/donor/dashboard/
    Returns computed dashboard stats for the authenticated donor.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DonorDashboardSerializer

    def get_object(self):
        if self.request.user.role != "donor":
            raise PermissionDenied("Only donors can access the dashboard.")

        donor_detail, _ = DonorDetails.objects.select_related(
            "user",
            "user__profile",
        ).get_or_create(user=self.request.user)
        return donor_detail
