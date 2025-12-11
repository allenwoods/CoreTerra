import typer
import httpx
from typing import Optional, List
from cli.core import config
import sys
import os

app = typer.Typer()

@app.callback()
def main():
    """
    CoreTerra CLI
    """
    pass

@app.command()
def login(username: str):
    """
    Login to CoreTerra backend.
    """
    api_url = config.get_api_url()
    try:
        response = httpx.post(f"{api_url}/auth/login", json={"username": username})
        if response.status_code == 200:
            data = response.json()
            user_id = data["user_id"]

            # Save to config
            current_config = config.load_config()
            current_config["user_id"] = user_id
            config.save_config(current_config)

            typer.echo(f"Logged in as {data['username']} ({user_id})")
        else:
            typer.echo(f"Login failed: {response.status_code}")
    except Exception as e:
        typer.echo(f"Connection error: {e}")

@app.command()
def capture(
    title: str,
    priority: str = typer.Option(config.get_default_priority(), "--priority", "-p", help="Task priority (1-5)"),
    body: str = typer.Option("", "--body", "-b", help="Task description"),
):
    """
    Capture a new task to Inbox.
    """
    user_id = config.ensure_logged_in()
    api_url = config.get_api_url()

    # Validate priority
    valid_priorities = config.get_priority_choices()
    if priority not in valid_priorities:
        typer.echo(f"Invalid priority '{priority}'. Choose from: {', '.join(valid_priorities)}")
        raise typer.Exit(1)

    payload = {
        "title": title,
        "priority": priority,
        "body": body,
        "user_id": user_id,
        "type": "Capture"
    }

    try:
        response = httpx.post(f"{api_url}/tasks/", json=payload)
        if response.status_code == 201:
            data = response.json()
            typer.echo(f"Captured task: {data['title']} (ID: {data['id']})")
        else:
            typer.echo(f"Failed to capture: {response.status_code} - {response.text}")
    except Exception as e:
        typer.echo(f"Error: {e}")

@app.command()
def complete(task_id: str):
    """
    Mark a task as completed (Done).
    """
    user_id = config.ensure_logged_in()
    api_url = config.get_api_url()

    # 1. Fetch for optimistic lock
    try:
        get_res = httpx.get(f"{api_url}/tasks/{task_id}")
        if get_res.status_code != 200:
            typer.echo(f"Task not found: {task_id}")
            raise typer.Exit(1)

        current_task = get_res.json()
        updated_at = current_task["updated_at"]

        # 2. Put status=completed
        payload = {
            "status": "completed",
            "user_id": user_id,
            "updated_at": updated_at
        }

        response = httpx.put(f"{api_url}/tasks/{task_id}/status", json=payload)

        if response.status_code == 200:
            typer.echo(f"Completed task {task_id}")
            import json
            typer.echo(json.dumps(response.json(), indent=2))
        else:
            typer.echo(f"Failed to complete: {response.status_code} - {response.text}")

    except Exception as e:
        typer.echo(f"Error: {e}")

@app.command("list")
def list_tasks(
    status: Optional[str] = typer.Option(None, "--status", "-s", help="Filter by status"),
    limit: int = typer.Option(50, "--limit", "-n", help="Limit results"),
):
    """
    List tasks.
    """
    config.ensure_logged_in()
    api_url = config.get_api_url()

    params = {"limit": limit}
    if status:
        params["status"] = status

    try:
        response = httpx.get(f"{api_url}/tasks/", params=params)
        if response.status_code == 200:
            tasks = response.json()
            import json
            typer.echo(json.dumps(tasks, indent=2))
        else:
            typer.echo(f"Failed to list tasks: {response.status_code}")
    except Exception as e:
        typer.echo(f"Error: {e}")

@app.command()
def show(task_id: str):
    """
    Show task details.
    """
    config.ensure_logged_in()
    api_url = config.get_api_url()

    try:
        response = httpx.get(f"{api_url}/tasks/{task_id}")
        if response.status_code == 200:
            task = response.json()
            import json
            typer.echo(json.dumps(task, indent=2))
        else:
            typer.echo(f"Task not found or error: {response.status_code}")
    except Exception as e:
        typer.echo(f"Error: {e}")

@app.command()
def clarify(
    task_id: str,
    title: Optional[str] = typer.Option(None, "--title", help="New title"),
    priority: Optional[str] = typer.Option(None, "--priority", "-p", help="New priority"),
    role: Optional[str] = typer.Option(None, "--role", "-r", help="Role owner"),
    tags: Optional[str] = typer.Option(None, "--tags", "-t", help="Comma-separated tags"),
    due: Optional[str] = typer.Option(None, "--due", "-d", help="Due date (YYYY-MM-DD)"),
):
    """
    Clarify task metadata (Role, Priority, Tags, etc).
    """
    config.ensure_logged_in()
    api_url = config.get_api_url()

    # Validate priority if provided
    if priority:
        valid_priorities = config.get_priority_choices()
        if priority not in valid_priorities:
            typer.echo(f"Invalid priority '{priority}'. Choose from: {', '.join(valid_priorities)}")
            raise typer.Exit(1)

    # 1. Fetch current task to get updated_at (optimistic lock)
    try:
        get_res = httpx.get(f"{api_url}/tasks/{task_id}")
        if get_res.status_code != 200:
            typer.echo(f"Task not found: {task_id}")
            raise typer.Exit(1)

        current_task = get_res.json()
        updated_at = current_task["updated_at"]

        # 2. Construct Patch
        payload = {"updated_at": updated_at}
        if title: payload["title"] = title
        if priority: payload["priority"] = priority
        if role: payload["role_owner"] = role
        if tags: payload["tags"] = [t.strip() for t in tags.split(",")]
        if due: payload["due_date"] = due

        # 3. Send Patch
        response = httpx.patch(f"{api_url}/tasks/{task_id}", json=payload)

        if response.status_code == 200:
            typer.echo(f"Updated task {task_id}")
            import json
            typer.echo(json.dumps(response.json(), indent=2))
        else:
            typer.echo(f"Failed to update: {response.status_code} - {response.text}")

    except Exception as e:
        typer.echo(f"Error: {e}")

@app.command()
def organize(
    task_id: str,
    status: str = typer.Option(..., "--status", "-s", help="New status (next, waiting, etc)"),
):
    """
    Organize task by changing its status (container).
    """
    user_id = config.ensure_logged_in()
    api_url = config.get_api_url()

    # 1. Fetch current task for optimistic lock
    try:
        get_res = httpx.get(f"{api_url}/tasks/{task_id}")
        if get_res.status_code != 200:
            typer.echo(f"Task not found: {task_id}")
            raise typer.Exit(1)

        current_task = get_res.json()
        updated_at = current_task["updated_at"]

        # 2. Construct PUT Payload
        payload = {
            "status": status,
            "user_id": user_id,
            "updated_at": updated_at
        }

        # 3. Send PUT
        response = httpx.put(f"{api_url}/tasks/{task_id}/status", json=payload)

        if response.status_code == 200:
            typer.echo(f"Updated status of {task_id} to {status}")
            import json
            typer.echo(json.dumps(response.json(), indent=2))
        else:
            typer.echo(f"Failed to organize: {response.status_code} - {response.text}")

    except Exception as e:
        typer.echo(f"Error: {e}")

if __name__ == "__main__":
    app()
