
from django.urls import path

from ..services.donorService import DonorProfileView
from ..services.donorDashboardService import DonorDashboardView
from ..services.donorAlertService import DonorAlertListView, DonorAlertMarkReadView
from ..services.donationHistoryService import DonorDonationHistoryView
from ..services.public.donorQrService import PublicDonorByQrView
from ..services.bloodCampService import (
    UpcomingBloodCampsView,
    OrganizerBloodCampView,
    RegisterForCampView,
    CampRegistrationsView,
    ApproveCampRegistrationView
)

urlpatterns = [
    path('profile/', DonorProfileView.as_view(), name='donor-profile-dashboard'),
    path('dashboard/', DonorDashboardView.as_view(), name='donor-dashboard-stats'),
    path('donations/', DonorDonationHistoryView.as_view(), name='donor-donation-history'),
    path('alerts/', DonorAlertListView.as_view(), name='donor-alerts-list'),
    path('alerts/<int:pk>/read/', DonorAlertMarkReadView.as_view(), name='donor-alert-mark-read'),
    path("public/<uuid:qr_id>/", PublicDonorByQrView.as_view(), name="public-donor-by-qr"),
    
    # Blood Camp Routes
    path('camps/upcoming/', UpcomingBloodCampsView.as_view(), name='upcoming-camps'),
    path('camps/', OrganizerBloodCampView.as_view(), name='organizer-camps'),
    path('camps/<int:pk>/register/', RegisterForCampView.as_view(), name='register-camp'),
    path('camps/<int:pk>/registrations/', CampRegistrationsView.as_view(), name='camp-registrations'),
    path('camps/registrations/<int:pk>/approve/', ApproveCampRegistrationView.as_view(), name='approve-camp-registration'),
]
