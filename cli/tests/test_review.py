from unittest.mock import patch, MagicMock
from typer.testing import CliRunner
from cli.main import app

runner = CliRunner()

def test_list_tasks():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.get") as mock_get:

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"task_id": "1", "title": "Task 1", "status": "inbox", "priority": "1"},
            {"task_id": "2", "title": "Task 2", "status": "next", "priority": "2"}
        ]
        mock_get.return_value = mock_response

        result = runner.invoke(app, ["list"])

        assert result.exit_code == 0
        assert "Task 1" in result.stdout
        assert "Task 2" in result.stdout

        # Verify call
        mock_get.assert_called_once()

def test_show_task():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.get") as mock_get:

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "task_id": "123", "title": "Detailed Task", "body": "Some details",
            "status": "inbox", "priority": "1", "updated_at": "2023-01-01T00:00:00Z"
        }
        mock_get.return_value = mock_response

        result = runner.invoke(app, ["show", "123"])

        assert result.exit_code == 0
        assert "Detailed Task" in result.stdout
        assert "Some details" in result.stdout
