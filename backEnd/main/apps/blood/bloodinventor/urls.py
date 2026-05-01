from django.urls import include, path

from .services.public.live_stock_service import live_stock

urlpatterns = [
    path("public/", include("apps.blood.bloodinventor.urls_public")),
    path("officer/", include("apps.blood.bloodinventor.urls_officer")),
    path("adminDashboard/", include("apps.blood.bloodinventor.urls_admin")),
    # Backward-compatible alias used by existing frontend.
    path("live-stock/", live_stock, name="live_stock"),
]
