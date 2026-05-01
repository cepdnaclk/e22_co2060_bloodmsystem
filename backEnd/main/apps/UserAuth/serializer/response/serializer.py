from rest_framework import serializers

from ...models import Profile, User
from ...models.hospital import Hospital


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "fullName",
            "nic_number",
            "phoneNumber",
            "blood_group",
            "country",
            "district",
            "hospital",
        ]

        read_only_fields=[
            "fullName",
            "nic_number",
            "blood_group",
        ]
        extra_kwargs = {
            "country": {"required": False, "allow_null": True},
            "district": {"required": False, "allow_null": True},
            "hospital": {"required": False, "allow_null": True},
        }


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital

        fields = [
            "id",
            "hosName",
            "district",
            "country",
            "address",
            "phone",
            "latitude",
            "longitude",
        ]
