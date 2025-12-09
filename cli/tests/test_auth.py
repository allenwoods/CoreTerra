from unittest.mock import patch, MagicMock
from typer.testing import CliRunner
from cli.main import app
from cli.core import config
import os
import json

runner = CliRunner()

def test_login_success():
    # Mock httpx response
    with patch("httpx.post") as mock_post:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "user_id": "test-uuid",
            "username": "Alex",
            "email": "alex@example.com"
        }
        mock_post.return_value = mock_response

        # Mock config save
        with patch("cli.core.config.save_config") as mock_save:
            result = runner.invoke(app, ["login", "Alex"])
            assert result.exit_code == 0
            assert "Logged in as Alex" in result.stdout

            # Verify save was called with correct user_id
            mock_save.assert_called_with({"user_id": "test-uuid"})

def test_login_failure():
    with patch("httpx.post") as mock_post:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_post.return_value = mock_response

        result = runner.invoke(app, ["login", "InvalidUser"])
        assert result.exit_code == 0 # Typers logic might not crash but print error
        assert "Login failed" in result.stdout
