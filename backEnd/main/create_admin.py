import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.UserAuth.models import Profile

User = get_user_model()

def create_system_admin():
    admin_email = 'admin@hopedrop.com'
    admin_username = 'admin'
    admin_password = 'AdminPassword123!'

    if User.objects.filter(email=admin_email).exists():
        print("✅ Admin account already exists:")
        print(f"   Email: {admin_email}")
        return

    print("⏳ Creating System Admin account...")

    # 1. Create the core User object
    user = User.objects.create_superuser(
        username=admin_username,
        email=admin_email,
        password=admin_password
    )

    # 2. Explicitly set the custom role to "admin"
    user.role = 'admin'
    user.save()

    # 3. Create a default profile to satisfy JWT payload expectations
    Profile.objects.create(
        user=user,
        fullName="System Administrator",
        nic_number="000000000000",
        blood_group="O+",
    )

    print("✅ System Admin successfully created!")
    print(f"   Username: {admin_username}")
    print(f"   Email:    {admin_email}")
    print(f"   Password: {admin_password}")
    print("\nYou can now go to http://localhost:5173/login and log in with these credentials.")

if __name__ == '__main__':
    create_system_admin()

