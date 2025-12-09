from unittest.mock import patch, MagicMock
from typer.testing import CliRunner
from cli.main import app

runner = CliRunner()

def test_capture_success():
    with patch("cli.core.config.ensure_logged_in", return_value="user-uuid"), \
         patch("httpx.post") as mock_post:

        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {"id": "task-uuid", "title": "Buy Milk"}
        mock_post.return_value = mock_response

        result = runner.invoke(app, ["capture", "Buy Milk", "--priority", "1", "--body", "Details"])

        assert result.exit_code == 0
        assert "Captured task: Buy Milk" in result.stdout

        # Verify call
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert kwargs["json"]["title"] == "Buy Milk"
        assert kwargs["json"]["priority"] == "1"
        assert kwargs["json"]["body"] == "Details"
        assert kwargs["json"]["user_id"] == "user-uuid"

def test_capture_not_logged_in():
    # If not logged in, ensure_logged_in should raise Exit
    # We test this behavior
    # Actually ensure_logged_in calls typer.Exit
    # Let's mock load_config instead to simulate empty config
    with patch("cli.core.config.get_user_id", return_value=None):
         result = runner.invoke(app, ["capture", "Buy Milk"])
         assert result.exit_code == 1
         assert "Not logged in" in result.stdout
