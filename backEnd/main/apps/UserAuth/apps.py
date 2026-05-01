from django.apps import AppConfig


class UserConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.UserAuth"
    label = "UserAuth"  # keeps AUTH_USER_MODEL='UserAuth.User' working
