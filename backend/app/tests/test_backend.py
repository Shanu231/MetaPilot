import pytest
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, verify_token
from app.schemas.schemas import UserRegister

def test_settings_loaded():
    assert settings.PROJECT_NAME == "MetaPilot"
    assert settings.API_VERSION == "/api"
    assert isinstance(settings.ALLOWED_CORS_ORIGINS, list)

def test_password_hashing():
    pwd = "secure_password"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_generation_and_decoding():
    subject = "user-12345"
    role = "Developer"
    token = create_access_token(subject, role)
    assert isinstance(token, str)

    payload = verify_token(token)
    assert payload is not None
    assert payload.get("sub") == subject
    assert payload.get("role") == role
    assert payload.get("type") == "access"

def test_invalid_jwt_decoding():
    assert verify_token("invalid_header.invalid_payload.invalid_signature") is None

def test_pydantic_schema_validation():
    data = {
        "email": "test@metapilot.io",
        "name": "Test User",
        "password": "mypassword"
    }
    schema = UserRegister(**data)
    assert schema.email == "test@metapilot.io"
    assert schema.name == "Test User"
    assert schema.password == "mypassword"

    with pytest.raises(ValueError):
        # Invalid email address schema check
        UserRegister(email="notanemail", name="Short", password="pwd")
