from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .services.views import (
    MyTokenObtainPairView,
    RegisterView,
    get_user_info,
    get_user_profile,
    logout_view,
    resolve_hospital,
    update_user_profile,
)

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", logout_view, name="logout"),
    # User profile endpoints
    path("profile/", get_user_profile, name="user_profile"),
    path("profile/update/", update_user_profile, name="update_profile"),
    path("getuser/", get_user_info, name="user_info"),
    path("hospitals/resolve/", resolve_hospital, name="resolve_hospital"),
]
