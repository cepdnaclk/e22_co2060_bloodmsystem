from django.utils import timezone

from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models.bloodinventor import BloodInventory
from ..serializers.response.inventoryResponseserializer import (
    LiveStockResponseSerializer,
)

BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


def getStockStatus(total: int) -> str:
    if total < 10:
        return "Critical"
    if 10 < total < 30:
        return "Low"
    return "Normal"


@api_view(["GET"])
@permission_classes([AllowAny])
def liveStock(request):
    today = timezone.localdate()
    rows = (
        BloodInventory.objects.filter(status="available", expiry_date=today)
        .values("blood_type")
        .annotate(total_units=Sum("quantity"))
    )
    units_by_type = {row["blood_type"]: int(row["total_units"] or 0) for row in rows}
    stock = []
    for blood_type in BLOOD_TYPES:
        units = units_by_type.get(blood_type, 0)
        stock.append(
            {
                "bloodType": blood_type,
                "units": units,
                "status": getStockStatus(units),
            }
        )

    payload = {
        "updatedAt": timezone.now(),
        "stocks": stock,
    }

    serializer = LiveStockResponseSerializer(payload)
    return Response(serializer.data, status=200)
