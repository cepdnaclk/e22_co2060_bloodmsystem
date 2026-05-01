import logging

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

logger = logging.getLogger(__name__)  # For logging errors


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get(self.username_field)

        if identifier and "@" not in identifier:
            user = (
                get_user_model()
                .objects.filter(username__iexact=identifier)
                .values("email")
                .first()
            )
            if not user:
                raise AuthenticationFailed("No active account found with the given credentials")
            attrs[self.username_field] = user["email"]

        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 1. Add User Role
        token["role"] = user.role

        # 2. Add Profile Data - Handle missing profile gracefully
        try:
            profile = user.profile
            token["fullName"] = profile.fullName
            token["NIC_number"] = profile.nic_number
            token["phoneNumber"] = (
                str(profile.phoneNumber) if profile.phoneNumber else None
            )
            token["blood_group"] = profile.blood_group

            # 3. Add Location/Hospital IDs with null safety
            token["country_id"] = profile.country.id if profile.country else None
            token["district_id"] = profile.district.id if profile.district else None
            token["hospital_id"] = profile.hospital.id if profile.hospital else None

        except ObjectDoesNotExist:
            # Profile doesn't exist - set defaults
            logger.warning("Profile not found for user %s", user.id)
            token["fullName"] = None
            token["NIC_number"] = None
            token["phoneNumber"] = None
            token["country_id"] = None
            token["district_id"] = None
            token["hospital_id"] = None

        except AttributeError as e:
            # Field missing or incorrect access
            logger.error("AttributeError for user %s: %s", user.id, str(e))
            token["fullName"] = None
            token["NIC_number"] = None
            token["phoneNumber"] = None
            token["country_id"] = None
            token["district_id"] = None
            token["hospital_id"] = None

        except Exception as e:
            # Catch any other unexpected errors
            logger.error(
                "Unexpected error in token creation for user %s: %s",
                user.id,
                str(e),
            )
            # Return token with user role only - don't crash the login
            pass

        return token
