import os
import frontmatter
from datetime import datetime, timezone
from uuid import UUID
from typing import List, Optional, Any, Dict
from git import Repo, Actor

from src.schemas import (
    TaskMetadataBase,
    TaskMetadataResponse,
    TaskFullResponse,
)

from src.users import get_git_author

from src.database import get_db_connection, _get_paths


def _get_repo() -> Repo:
    """Gets or initializes the Git repository."""
    data_dir, _ = _get_paths()
    os.makedirs(data_dir, exist_ok=True)
    try:
        repo = Repo(data_dir)
    except Exception:
        repo = Repo.init(data_dir)
        # Configure local user if not present (fallback)
        if not repo.config_reader().has_option("user", "email"):
            repo.config_writer().set_value("user", "name", "System").release()
            repo.config_writer().set_value(
                "user", "email", "system@coreterra.io"
            ).release()
    return repo


def save_user_to_file_and_db(user_data: Dict[str, Any]):
    """
    Saves user to MyST file and then updates DB.
    Atomic Transaction: File -> Git -> DB.
    """
    data_dir, _ = _get_paths()
    users_dir = os.path.join(data_dir, "users")
    os.makedirs(users_dir, exist_ok=True)

    user_id = user_data["user_id"]
    file_path = os.path.join(users_dir, f"{user_id}.md")

    # 1. Write MyST file
    post = frontmatter.Post("")  # Empty content for now
    post.metadata = user_data

    with open(file_path, "wb") as f:
        frontmatter.dump(post, f)

    # 2. Git Commit
    repo = _get_repo()
    repo.index.add([file_path])

    # System commit for user creation
    author = Actor("System", "system@coreterra.io")
    repo.index.commit(
        f"feat: Create/Update user {user_data['username']}",
        author=author,
        committer=author,
    )

    # 3. Update SQLite
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT OR REPLACE INTO users (user_id, username, email, role, avatar, color, level, experience, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            user_id,
            user_data["username"],
            user_data["email"],
            user_data["role"],
            user_data["avatar"],
            user_data["color"],
            user_data.get("level", 1),
            user_data.get("experience", 0),
            user_data.get("created_at", datetime.now(timezone.utc).isoformat()),
        ),
    )

    conn.commit()
    conn.close()


def init_default_users():
    """Insert default users if they don't exist."""
    # We check if users table is empty to avoid re-seeding and creating commits on every startup
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM users")
    count = cursor.fetchone()[0]
    conn.close()

    if count > 0:
        return

    default_users = [
        # (user_id, username, email, role, avatar, color)
        (
            "550e8400-e29b-41d4-a716-446655440000",
            "Test User",
            "test@example.com",
            "backend-engineer",
            "https://i.pravatar.cc/150?u=test",
            "bg-gray-500",
        ),
        (
            "u1",
            "Alex",
            "alex@coreterra.io",
            "frontend-engineer",
            "https://i.pravatar.cc/150?u=alex",
            "bg-blue-500",
        ),
        (
            "u2",
            "Brenda",
            "brenda@coreterra.io",
            "devops-engineer",
            "https://i.pravatar.cc/150?u=brenda",
            "bg-purple-500",
        ),
        (
            "u3",
            "Charles",
            "charles@coreterra.io",
            "backend-engineer",
            "https://i.pravatar.cc/150?u=charles",
            "bg-red-500",
        ),
        (
            "u4",
            "David",
            "david@coreterra.io",
            "backend-engineer",
            "https://i.pravatar.cc/150?u=david",
            "bg-green-500",
        ),
        (
            "u5",
            "Sarah",
            "sarah@coreterra.io",
            "ui-designer",
            "https://i.pravatar.cc/150?u=sarah",
            "bg-yellow-500",
        ),
    ]

    now = datetime.now(timezone.utc).isoformat()
    for user_id, username, email, role, avatar, color in default_users:
        user_data = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "role": role,
            "avatar": avatar,
            "color": color,
            "created_at": now,
        }
        save_user_to_file_and_db(user_data)


def init_db():
    """Initializes the SQLite database schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Tasks Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            ct_id TEXT PRIMARY KEY,
            status TEXT,
            priority TEXT,
            role_owner TEXT,
            timestamp_capture TEXT,
            timestamp_commitment TEXT,
            timestamp_completion TEXT,
            due_date TEXT,
            updated_at TEXT,
            title TEXT,
            user_id TEXT
        )
    """)

    # Create Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT,
            color TEXT,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

    # Initialize default data
    init_default_users()


def save_task(
    task_id: UUID, metadata: TaskMetadataBase, body: str, commit_message: str
) -> TaskMetadataResponse:
    """
    Saves a task:
    1. Writes MyST file.
    2. Commits to Git.
    3. Updates SQLite index.
    """
    data_dir, _ = _get_paths()
    repo = _get_repo()
    file_path = os.path.join(data_dir, f"{task_id}.md")

    # 1. Write MyST file
    post = frontmatter.Post(body)
    # Convert Pydantic model to dict, excluding None to keep frontmatter clean
    meta_dict = metadata.model_dump(exclude_none=True, mode="json")
    # Filter out body from metadata if it slipped in
    if "body" in meta_dict:
        del meta_dict["body"]

    post.metadata = meta_dict

    try:
        with open(file_path, "wb") as f:
            frontmatter.dump(post, f)

        # 2. Git Commit
        repo.index.add([file_path])

        author = None
        if metadata.user_id:
            user_info = get_git_author(metadata.user_id)
            if user_info:
                author = Actor(user_info[0], user_info[1])

        repo.index.commit(commit_message, author=author, committer=author)

        # 3. Update SQLite
        conn = get_db_connection()
        cursor = conn.cursor()

        # Prepare data for SQL
        sql_data = {
            "ct_id": str(task_id),
            "status": metadata.status.value,
            "priority": metadata.priority.value if metadata.priority else None,
            "role_owner": metadata.role_owner.value if metadata.role_owner else None,
            "timestamp_capture": metadata.capture_timestamp.isoformat()
            if metadata.capture_timestamp
            else None,
            "timestamp_commitment": metadata.commitment_timestamp.isoformat()
            if metadata.commitment_timestamp
            else None,
            "timestamp_completion": metadata.completion_timestamp.isoformat()
            if metadata.completion_timestamp
            else None,
            "due_date": metadata.due_date.isoformat() if metadata.due_date else None,
            "updated_at": metadata.updated_at.isoformat(),
            "title": metadata.title,
            "user_id": str(metadata.user_id),
        }

        cursor.execute(
            """
            INSERT OR REPLACE INTO tasks (
                ct_id, status, priority, role_owner, timestamp_capture,
                timestamp_commitment, timestamp_completion, due_date, updated_at, title, user_id
            ) VALUES (
                :ct_id, :status, :priority, :role_owner, :timestamp_capture,
                :timestamp_commitment, :timestamp_completion, :due_date, :updated_at, :title, :user_id
            )
        """,
            sql_data,
        )

        conn.commit()
        conn.close()

    except Exception as e:
        # Rollback strategy
        print(f"Error saving task {task_id}: {e}")
        # Soft reset git to undo commit if it happened
        # Note: checking if commit happened is tricky, but soft reset HEAD~1 if it matches our message/author might work.
        # Simpler: just ensure consistency. If DB fails, we have a file/git record but no DB record.
        # Rebuilding DB from files is a repair strategy.
        # But for atomic transaction simulation, we should revert the file change.
        # git reset --mixed HEAD (if added)
        # For this prototype, we'll just log and re-raise.
        # Ideally: repo.git.reset('HEAD') if committed, or checkout file if not.
        raise e

    return TaskMetadataResponse(**meta_dict)


def get_task(task_id: UUID) -> Optional[TaskFullResponse]:
    """Retrieves a task from file system."""
    data_dir, _ = _get_paths()
    file_path = os.path.join(data_dir, f"{task_id}.md")
    if not os.path.exists(file_path):
        return None

    post = frontmatter.load(file_path)

    # Reconstruct Pydantic model
    try:
        # We need to ensure required fields are present.
        # If file is corrupted or missing fields, this might fail.
        # Ideally we read from SQLite for metadata speed, but file is Source of Truth.
        return TaskFullResponse(**post.metadata, body=post.content)
    except Exception as e:
        print(f"Error parsing task {task_id}: {e}")
        return None


def list_tasks(
    filters: Dict[str, Any] = None,
    tag: str = None,
    sort_by: str = None,
    order: str = "asc",
    limit: int = None,
    offset: int = 0,
) -> List[TaskMetadataResponse]:
    """Lists tasks from SQLite index with support for filtering, sorting, and pagination."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM tasks"
    params = []

    conditions = []

    # Handle standard filters (status, priority)
    if filters:
        for key, value in filters.items():
            if value is not None:
                conditions.append(f"{key} = ?")
                params.append(value)

    # Handle tag filtering (tags stored as JSON array in SQLite)
    if tag:
        # SQLite JSON function to check if tag exists in tags array
        # Note: This assumes tags column stores JSON array like '["tag1", "tag2"]'
        conditions.append("(tags IS NOT NULL AND tags LIKE ?)")
        params.append(f'%"{tag}"%')

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    # Sorting
    if sort_by:
        # Mapping to safe column names to prevent injection
        allowed_cols = {
            "priority": "priority",
            "due_date": "due_date",
            "created_at": "timestamp_capture",  # Map created_at to timestamp_capture
            "updated_at": "updated_at",
            "timestamp_capture": "timestamp_capture",
        }

        if sort_by in allowed_cols:
            safe_col = allowed_cols[sort_by]
            if order.lower() not in ["asc", "desc"]:
                order = "asc"
            query += f" ORDER BY {safe_col} {order}"

    # Pagination
    if limit is not None:
        query += f" LIMIT {limit}"
        if offset > 0:
            query += f" OFFSET {offset}"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    tasks = []
    for row in rows:
        # Map SQLite row back to Pydantic model
        # Note: some fields might need type conversion if not handled by Pydantic automatically from strings
        # Pydantic is good at parsing ISO strings to datetime
        try:
            task_dict = dict(row)
            # remap keys if needed, e.g. ct_id -> task_id
            task_dict["task_id"] = task_dict.pop("ct_id")

            if "timestamp_commitment" in task_dict:
                task_dict["commitment_timestamp"] = task_dict.pop(
                    "timestamp_commitment"
                )
            if "timestamp_capture" in task_dict:
                task_dict["capture_timestamp"] = task_dict.pop("timestamp_capture")
            if "timestamp_completion" in task_dict:
                task_dict["completion_timestamp"] = task_dict.pop(
                    "timestamp_completion"
                )

            tasks.append(TaskMetadataResponse(**task_dict))
        except Exception as e:
            print(f"Skipping invalid row: {e}")

    conn.close()
    return tasks


def get_task_history(task_id: UUID, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Retrieves the Git commit history for a specific task.

    Args:
        task_id: UUID of the task
        limit: Optional maximum number of commits to return (default: all)

    Returns:
        List of commit metadata dictionaries, ordered from newest to oldest
        Returns empty list if task file doesn't exist or has no commits

    Raises:
        No exceptions - returns empty list for missing tasks
    """
    data_dir, _ = _get_paths()
    file_path = os.path.join(data_dir, f"{task_id}.md")

    # Check if task file exists
    if not os.path.exists(file_path):
        return []

    try:
        repo = _get_repo()

        # Get relative path from repo root for git operations
        relative_path = os.path.relpath(file_path, data_dir)

        # Build kwargs for iter_commits
        kwargs = {}
        if limit is not None:
            kwargs['max_count'] = limit

        # Iterate commits affecting this specific file
        commits = repo.iter_commits(paths=relative_path, **kwargs)

        history = []
        for commit in commits:
            history.append({
                'commit_hash': commit.hexsha,
                'author_name': commit.author.name,
                'author_email': commit.author.email,
                'timestamp': commit.committed_datetime,
                'message': commit.message.strip()
            })

        return history

    except Exception as e:
        # Log error but don't crash - return empty history
        print(f"Error retrieving history for task {task_id}: {e}")
        return []
