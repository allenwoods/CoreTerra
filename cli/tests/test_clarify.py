from unittest.mock import patch, MagicMock
from typer.testing import CliRunner
from cli.main import app

runner = CliRunner()

def test_clarify_success():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.get") as mock_get, \
         patch("httpx.patch") as mock_patch:

        # 1. Mock GET (fetch current task)
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get_response.json.return_value = {
            "task_id": "123", "updated_at": "timestamp_v1"
        }
        mock_get.return_value = mock_get_response

        # 2. Mock PATCH
        mock_patch_response = MagicMock()
        mock_patch_response.status_code = 200
        mock_patch_response.json.return_value = {"task_id": "123", "role_owner": "backend-engineer"}
        mock_patch.return_value = mock_patch_response

        result = runner.invoke(app, ["clarify", "123", "--role", "backend-engineer"])

        assert result.exit_code == 0
        assert "Updated task 123" in result.stdout

        # Verify GET call
        mock_get.assert_called_once()

        # Verify PATCH call
        mock_patch.assert_called_once()
        args, kwargs = mock_patch.call_args
        assert kwargs["json"]["role_owner"] == "backend-engineer"
        assert kwargs["json"]["updated_at"] == "timestamp_v1"

def test_clarify_conflict():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.get") as mock_get, \
         patch("httpx.patch") as mock_patch:

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"updated_at": "v1"}

        mock_patch.return_value.status_code = 409
        mock_patch.return_value.text = "Conflict"

        result = runner.invoke(app, ["clarify", "123", "--role", "backend-engineer"])

        assert "Conflict" in result.stdout
