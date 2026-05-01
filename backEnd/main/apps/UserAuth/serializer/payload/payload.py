import logging

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

logger = logging.getLogger(__name__)  # For logging errors


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @staticmethod
    def _empty_profile_claims():
        return {
            "fullName": None,
            "NIC_number": None,
            "phoneNumber": None,
            "blood_group": None,
            "country_id": None,
            "district_id": None,
            "hospital_id": None,
        }

    @staticmethod
    def _resolve_identifier_to_email(identifier):
        if not identifier:
            raise AuthenticationFailed("Email or username is required")

        User = get_user_model()
        lookup = "email__iexact" if "@" in identifier else "username__iexact"
        user = User.objects.filter(**{lookup: identifier}).only("email", "is_active").first()

        if not user or not user.is_active:
            raise AuthenticationFailed("No active account found with the given credentials")

        email = getattr(user, "email", None)
        if not email:
            raise AuthenticationFailed("No active account found with the given credentials")
        return email

    def validate(self, attrs):
        attrs[self.username_field] = self._resolve_identifier_to_email(
            attrs.get(self.username_field)
        )

        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = getattr(user, "role", None)

        try:
            profile = getattr(user, "profile")
            claims = {
                "fullName": profile.fullName,
                "NIC_number": profile.nic_number,
                "phoneNumber": str(profile.phoneNumber) if profile.phoneNumber else None,
                "blood_group": profile.blood_group,
                "country_id": profile.country.id if profile.country else None,
                "district_id": profile.district.id if profile.district else None,
                "hospital_id": profile.hospital.id if profile.hospital else None,
            }
            for key, value in claims.items():
                token[key] = value

        except ObjectDoesNotExist:
            logger.warning("Profile not found for user %s", user.id)
            for key, value in cls._empty_profile_claims().items():
                token[key] = value

        except AttributeError as e:
            logger.error("AttributeError for user %s: %s", user.id, str(e))
            for key, value in cls._empty_profile_claims().items():
                token[key] = value

        except Exception as e:
            logger.error(
                "Unexpected error in token creation for user %s: %s",
                user.id,
                str(e),
            )
            for key, value in cls._empty_profile_claims().items():
                token[key] = value

        return token
