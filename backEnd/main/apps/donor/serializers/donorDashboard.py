from rest_framework import serializers

from ..models.donorDetails import DonorDetails


class DonorDashboardSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the donor dashboard overview.
    Pulls computed eligibility data from the model and
    profile data (blood_group, fullName) from the related User → Profile.
    """

    blood_group = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    next_eligible = serializers.SerializerMethodField()
    is_eligible = serializers.BooleanField(read_only=True)

    class Meta:
        model = DonorDetails
        fields = [
            "full_name",
            "blood_group",
            "is_available",
            "is_eligible",
            "last_donation_date",
            "next_eligible",
            "total_donations",
            "total_events",
            "qr_id",
        ]

    def _profile(self, obj):
        return getattr(obj.user, "profile", None)

    def get_blood_group(self, obj):
        profile = self._profile(obj)
        return getattr(profile, "blood_group", None)

    def get_full_name(self, obj):
        profile = self._profile(obj)
        return getattr(profile, "fullName", None)

    def get_next_eligible(self, obj):
        """Return ISO date string or None if never donated."""
        date = obj.next_eligible_date
        return date.isoformat() if date else None
