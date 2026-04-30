from rest_framework import serializers

from ..models.donationHistory import DonationHistory


class DonationHistorySerializer(serializers.ModelSerializer):
    """
    Read-only serializer for donation history entries.
    Returns formatted data for the donor's History tab.
    """

    hospital_display = serializers.SerializerMethodField()

    class Meta:
        model = DonationHistory
        fields = [
            "id",
            "donation_date",
            "hospital_name",
            "hospital_display",
            "blood_group",
            "units",
            "status",
            "notes",
            "certificate_id",
            "created_at",
        ]
        read_only_fields = fields

    def get_hospital_display(self, obj):
        """Return the FK hospital name if available, otherwise the stored name."""
        if obj.hospital:
            return obj.hospital.hosName
        return obj.hospital_name
