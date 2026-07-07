from __future__ import annotations

from digimart_shared.events import EVENT_VERSIONS, EventEnvelope, EventType, build_event


def test_user_registered_event_contract() -> None:
    event = build_event(
        event_type=EventType.USER_REGISTERED,
        producer="identity-service",
        payload={
            "user_id": "40eeae37-ec03-41dd-b184-5fe318f0cc9d",
            "email": "user@example.com",
            "roles": ["buyer"],
        },
    )

    assert isinstance(event, EventEnvelope)
    assert event.event_type == EventType.USER_REGISTERED
    assert event.event_version == EVENT_VERSIONS[EventType.USER_REGISTERED]
    assert event.payload["roles"] == ["buyer"]


def test_login_succeeded_event_contract_has_audit_fields() -> None:
    event = build_event(
        event_type=EventType.AUTH_LOGIN_SUCCEEDED,
        producer="identity-service",
        payload={
            "user_id": "40eeae37-ec03-41dd-b184-5fe318f0cc9d",
            "ip_address": "203.0.113.10",
            "user_agent": "browser",
        },
    )

    assert event.event_type == EventType.AUTH_LOGIN_SUCCEEDED
    assert set(event.payload) == {"user_id", "ip_address", "user_agent"}

