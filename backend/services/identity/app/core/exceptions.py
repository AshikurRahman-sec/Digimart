"""Domain exceptions mapped to HTTP responses by routes/dependencies."""

from __future__ import annotations


class IdentityError(Exception):
    code = "IDENTITY_ERROR"
    status_code = 400

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class AuthenticationError(IdentityError):
    code = "AUTHENTICATION_FAILED"
    status_code = 401


class ForbiddenError(IdentityError):
    code = "FORBIDDEN"
    status_code = 403


class ConflictError(IdentityError):
    code = "CONFLICT"
    status_code = 409


class NotFoundError(IdentityError):
    code = "NOT_FOUND"
    status_code = 404

