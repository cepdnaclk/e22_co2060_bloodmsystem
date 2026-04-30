from rest_framework import serializers

from ..models.donorAlert import DonorAlert


class DonorAlertSerializer(serializers.ModelSerializer):
    """Read serializer for donor alerts."""

    class Meta:
        model = DonorAlert
        fields = [
            "id",
            "message",
            "alert_type",
            "is_read",
            "related_url",
            "created_at",
        ]
        read_only_fields = fields


class DonorAlertMarkReadSerializer(serializers.ModelSerializer):
    """Write serializer — only allows toggling is_read."""

    class Meta:
        model = DonorAlert
        fields = ["is_read"]
