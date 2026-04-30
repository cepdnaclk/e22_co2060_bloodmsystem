from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from ..models.donorDetails import DonorDetails
from ..models.donationHistory import DonationHistory
from ..serializers.donationHistory import DonationHistorySerializer


class DonationHistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class DonorDonationHistoryView(ListAPIView):
    """
    GET /api/v1/donor/donations/
    Returns a paginated list of donations for the authenticated donor.

    Query params:
        ?status=completed   — filter by status
        ?year=2026          — filter by donation year
        ?page=2             — pagination
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DonationHistorySerializer
    pagination_class = DonationHistoryPagination

    def get_queryset(self):
        if self.request.user.role != "donor":
            raise PermissionDenied("Only donors can view donation history.")

        donor, _ = DonorDetails.objects.get_or_create(user=self.request.user)

        qs = DonationHistory.objects.filter(donor=donor).select_related("hospital")

        # Optional filters
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)

        year = self.request.query_params.get("year")
        if year and year.isdigit():
            qs = qs.filter(donation_date__year=int(year))

        return qs
