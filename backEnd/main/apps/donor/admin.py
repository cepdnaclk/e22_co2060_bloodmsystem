from django.contrib import admin

from .models.donorDetails import DonorDetails
from .models.donorAlert import DonorAlert
<<<<<<< HEAD
=======
from .models.donationHistory import DonationHistory
from .models.bloodCamp import BloodCamp
from .models.campRegistration import CampRegistration
>>>>>>> 33d958e (enhanced donircamphistory model and add alrt feature)


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
<<<<<<< HEAD
=======


@admin.register(DonationHistory)
class DonationHistoryAdmin(admin.ModelAdmin):
    list_display = ("donor", "donation_date", "hospital_name", "blood_group", "units", "status")
    list_filter = ("status", "blood_group")
    search_fields = ("donor__user__username", "hospital_name")
    date_hierarchy = "donation_date"


@admin.register(BloodCamp)
class BloodCampAdmin(admin.ModelAdmin):
    list_display = ("title", "organizer", "date", "status", "location")
    list_filter = ("status", "date")
    search_fields = ("title", "location", "organizer__username")
    date_hierarchy = "date"


@admin.register(CampRegistration)
class CampRegistrationAdmin(admin.ModelAdmin):
    list_display = ("donor", "camp", "status", "appointment_time", "created_at")
    list_filter = ("status", "camp")
    search_fields = ("donor__user__username", "camp__title")

>>>>>>> 33d958e (enhanced donircamphistory model and add alrt feature)
