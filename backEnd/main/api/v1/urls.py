from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.UserAuth.urls")),
    path("blood/", include("apps.blood.bloodinventor.urls")),
    path('medical/',include("apps.medical.urls"))
]
