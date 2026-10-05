from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.transaction import TransactionCreate


def test_airtel_revenue():
    amount = Decimal("1000")
    rate = Decimal("0.05")
    assert amount * rate == Decimal("50.00")


def test_negative_transaction_rejected_by_schema():
    with pytest.raises(ValueError):
        TransactionCreate(
            booth_id=3,
            service_id=1,
            transaction_amount=Decimal("-1"),
        )


def test_login_accepts_default_demo_credentials():
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wina123"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_login_rejects_wrong_password():
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wrong"},
    )
    assert response.status_code == 401
