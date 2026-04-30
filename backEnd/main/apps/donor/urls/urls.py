
from django.urls import path

from ..services.donorService import DonorProfileView
from ..services.donorDashboardService import DonorDashboardView
from ..services.donorAlertService import DonorAlertListView, DonorAlertMarkReadView
from ..services.public.donorQrService import PublicDonorByQrView

urlpatterns = [
    path('profile/', DonorProfileView.as_view(), name='donor-profile-dashboard'),
    path('dashboard/', DonorDashboardView.as_view(), name='donor-dashboard-stats'),
    path('alerts/', DonorAlertListView.as_view(), name='donor-alerts-list'),
    path('alerts/<int:pk>/read/', DonorAlertMarkReadView.as_view(), name='donor-alert-mark-read'),
    path("public/<uuid:qr_id>/", PublicDonorByQrView.as_view(), name="public-donor-by-qr"),
]
