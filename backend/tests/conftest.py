import os
import shutil
import tempfile
import pytest
from fastapi.testclient import TestClient
from src.main import app
import git


@pytest.fixture(scope="function")
def temp_workspace():
    """
    Creates a temporary workspace with:
    1. A temporary directory for file storage.
    2. A git repository initialized in that directory.
    3. A temporary SQLite database.
    """
    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()

    # Initialize Git repo
    repo = git.Repo.init(temp_dir)
    # Configure git user for commits
    repo.config_writer().set_value("user", "name", "Test User").release()
    repo.config_writer().set_value("user", "email", "test@example.com").release()

    # Create SQLite DB path
    db_path = os.path.join(temp_dir, "coreterra.db")

    # Set environment variables for the app to use
    os.environ["CORETERRA_DATA_DIR"] = temp_dir
    os.environ["CORETERRA_DB_PATH"] = db_path

    yield temp_dir

    # Cleanup
    shutil.rmtree(temp_dir)
    if "CORETERRA_DATA_DIR" in os.environ:
        del os.environ["CORETERRA_DATA_DIR"]
    if "CORETERRA_DB_PATH" in os.environ:
        del os.environ["CORETERRA_DB_PATH"]


@pytest.fixture(scope="function")
def seeded_workspace(temp_workspace):
    """
    Seeds the temp workspace with fixture files.
    """
    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")
    if os.path.exists(fixtures_dir):
        for filename in os.listdir(fixtures_dir):
            if filename.endswith(".md"):
                src = os.path.join(fixtures_dir, filename)
                dst = os.path.join(temp_workspace, filename)
                shutil.copy(src, dst)

                # Add and commit to git so the system sees them as tracked files (if required)
                repo = git.Repo(temp_workspace)
                repo.index.add([filename])
                repo.index.commit(f"Add fixture {filename}")

                # NOTE: In a real implementation, we might need to trigger an indexing function here
                # to ensure the SQLite DB is populated with these files.
                # For now, we assume the application might have a startup hook or we'll rely on
                # the tests to trigger indexing/syncing if the app supports it.
                # If the app relies on a background process, we might need to simulate that.

    return temp_workspace


@pytest.fixture(scope="function")
def client(temp_workspace):  # or seeded_workspace if we want default data
    """
    FastAPI TestClient.
    """
    with TestClient(app) as c:
        yield c
