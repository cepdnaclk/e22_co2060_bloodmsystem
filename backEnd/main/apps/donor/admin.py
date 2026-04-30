from django.contrib import admin

from .models.donorDetails import DonorDetails
from .models.donorAlert import DonorAlert


@admin.register(DonorDetails)
class DonorAdmin(admin.ModelAdmin):
    list_display = ("user", "is_available", "last_donation_date", "total_donations")
    search_fields = ("user__username", "user__email", "user__profile__fullName")
    list_filter = ("is_available",)


@admin.register(DonorAlert)
class DonorAlertAdmin(admin.ModelAdmin):
    list_display = ("donor", "alert_type", "is_read", "created_at")
    list_filter = ("alert_type", "is_read")
    search_fields = ("message",)
