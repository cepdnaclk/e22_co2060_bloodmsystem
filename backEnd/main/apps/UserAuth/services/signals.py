from django.conf import settings
from django.core.mail import send_mail
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created


@receiver(reset_password_token_created)
def password_reset_token_created(
    sender, instance, reset_password_token, *args, **kwargs
):
    frontend_url = "http://localhost:5173/reset-password"
    reset_link = f"{frontend_url}?token={reset_password_token.key}"

    subject = "HOPEDROP Password Reset"
    message = (
        "You requested a password reset.\n\n"
        f"Use this link to reset your password:\n{reset_link}\n\n"
        "If you did not request this, ignore this email."
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [reset_password_token.user.email],
        fail_silently=False,
    )
