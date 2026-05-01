from django.urls import path

from .services.inventorService import liveStock

urlpatterns = [
    path("live-stock/", liveStock, name="live_stock"),
]
