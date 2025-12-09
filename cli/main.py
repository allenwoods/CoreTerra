import typer
import httpx
import sys

app = typer.Typer()

BACKEND_URL = "http://localhost:8000"

@app.callback(invoke_without_command=True)
def health(ctx: typer.Context):
    """Check backend health."""
    if ctx.invoked_subcommand is None:
        try:
            response = httpx.get(f"{BACKEND_URL}/health")
            if response.status_code == 200:
                typer.echo(f"Backend is healthy: {response.json()}")
            else:
                typer.echo(f"Backend returned error: {response.status_code}")
        except httpx.RequestError as exc:
            typer.echo(f"An error occurred while requesting {exc.request.url!r}.")

if __name__ == "__main__":
    app()
