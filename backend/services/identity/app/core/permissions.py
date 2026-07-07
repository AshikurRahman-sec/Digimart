"""Canonical role and permission definitions for DigiMart."""

from __future__ import annotations

from enum import StrEnum


class Role(StrEnum):
    BUYER = "buyer"
    CREATOR = "creator"
    ADMIN = "admin"


class Permission(StrEnum):
    PRODUCT_READ_PUBLIC = "product:read_public"
    PRODUCT_READ_OWN = "product:read_own"
    PRODUCT_CREATE = "product:create"
    PRODUCT_UPDATE_OWN = "product:update_own"
    PRODUCT_DELETE_OWN = "product:delete_own"
    PRODUCT_PUBLISH_OWN = "product:publish_own"
    CONTENT_UPLOAD = "content:upload"
    CONTENT_READ_OWN = "content:read_own"
    CONTENT_DELETE_OWN = "content:delete_own"
    CONTENT_PLAYBACK = "content:playback"
    CHECKOUT_CREATE = "checkout:create"
    PURCHASE_READ_OWN = "purchase:read_own"
    USER_SUSPEND = "user:suspend"
    PRODUCT_MODERATE = "product:moderate"
    ADMIN_DASHBOARD = "admin:dashboard"


ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.BUYER: {
        Permission.PRODUCT_READ_PUBLIC,
        Permission.CHECKOUT_CREATE,
        Permission.PURCHASE_READ_OWN,
        Permission.CONTENT_PLAYBACK,
    },
    Role.CREATOR: {
        Permission.PRODUCT_READ_PUBLIC,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_READ_OWN,
        Permission.PRODUCT_UPDATE_OWN,
        Permission.PRODUCT_DELETE_OWN,
        Permission.PRODUCT_PUBLISH_OWN,
        Permission.CONTENT_UPLOAD,
        Permission.CONTENT_READ_OWN,
        Permission.CONTENT_DELETE_OWN,
        Permission.CHECKOUT_CREATE,
        Permission.PURCHASE_READ_OWN,
        Permission.CONTENT_PLAYBACK,
    },
    Role.ADMIN: set(Permission),
}

