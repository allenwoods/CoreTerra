from unittest.mock import patch, MagicMock
from typer.testing import CliRunner
from cli.main import app

runner = CliRunner()

def test_complete_success():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.get") as mock_get, \
         patch("httpx.put") as mock_put:

        # 1. Mock GET
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get_response.json.return_value = {
            "task_id": "123", "updated_at": "timestamp_v1", "status": "next"
        }
        mock_get.return_value = mock_get_response

        # 2. Mock PUT
        mock_put_response = MagicMock()
        mock_put_response.status_code = 200
        mock_put_response.json.return_value = {"task_id": "123", "status": "completed"}
        mock_put.return_value = mock_put_response

        result = runner.invoke(app, ["complete", "123"])

        assert result.exit_code == 0
        assert "Completed task 123" in result.stdout

        # Verify PUT call
        mock_put.assert_called_once()
        args, kwargs = mock_put.call_args
        assert kwargs["json"]["status"] == "completed"
        assert kwargs["json"]["user_id"] == "user-uuid"
