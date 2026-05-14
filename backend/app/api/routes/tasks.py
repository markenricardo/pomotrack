"""Task routes"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.schemas.tasks import (
    Task,
    TaskCreate,
    TaskBreadcrumb,
    TaskWithChildren,
    TaskHistory,
)
from app.db.repositories import tasks as tasks_repository
from app.schemas.users import User
from app.schemas import tasks as schemas


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task"""
    if task.parent_id:
        parent_task = tasks_repository.get_task(db, task.parent_id, current_user.id)

        if not parent_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent task not found",
            )

    return tasks_repository.create_task(db, task, current_user.id)


@router.get("/", response_model=List[Task])
def read_tasks(
    parent_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks"""
    return tasks_repository.get_tasks(
        db,
        user_id=current_user.id,
        parent_id=parent_id,
        status=status,
        skip=skip,
        limit=limit,
    )


@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific task"""
    task = tasks_repository.get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task using PUT method"""
    db_task = tasks_repository.get_task(db, task_id, current_user.id)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updated_task = tasks_repository.update_task(
        db,
        task_id,
        current_user.id,
        task_update.model_dump(exclude_unset=True),
    )

    return updated_task


@router.patch("/{task_id}", response_model=schemas.Task)
def update_task_partial(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task partially using PATCH method"""
    db_task = tasks_repository.get_task(db, task_id, current_user.id)

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    try:
        updated_task = tasks_repository.update_task(
            db,
            task_id,
            current_user.id,
            task_update.model_dump(exclude_unset=True),
        )

        return updated_task

    except Exception as e:
        error_str = str(e).lower()

        if "circular reference" in error_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Circular reference detected in task hierarchy",
            ) from e

        raise


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task"""
    success = tasks_repository.delete_task(
        db,
        task_id,
        current_user.id,
        soft_delete=not permanent,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return None


@router.get("/{task_id}/breadcrumb", response_model=List[TaskBreadcrumb])
def get_task_breadcrumb(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the breadcrumb for a task"""
    task = tasks_repository.get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return tasks_repository.get_task_breadcrumb(db, task_id, current_user.id)


@router.get("/{task_id}/children", response_model=List[TaskBreadcrumb])
def get_task_children(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the children of a task"""
    task = tasks_repository.get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return tasks_repository.get_task_children(db, task_id, current_user.id)


@router.get("/{task_id}/tree", response_model=TaskWithChildren)
def get_task_with_children(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a task with all its children in a hierarchical structure"""
    task = tasks_repository.get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    children = tasks_repository.get_task_children(db, task_id, current_user.id)

    task_dict = {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "status": task.status,
        "parent_id": task.parent_id,
        "color_code": task.color_code,
        "estimated_duration": task.estimated_duration,
        "deadline": task.deadline,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "completed_at": task.completed_at,
        "children": [],
    }

    children_list = []

    for child in children:
        if child["level"] == 1:
            children_list.append(
                {
                    "id": child["id"],
                    "title": child["title"],
                    "children": [],
                }
            )

    task_dict["children"] = children_list

    return task_dict


@router.get("/{task_id}/history", response_model=List[TaskHistory])
def get_task_history(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get history for a specific task"""
    task = tasks_repository.get_task(
        db,
        task_id,
        current_user.id,
        include_deleted=True,
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return tasks_repository.get_task_history(db, task_id)


@router.post("/{task_id}/restore", response_model=schemas.Task)
def restore_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Restore a soft-deleted task"""
    db_task = tasks_repository.get_task(
        db,
        task_id,
        current_user.id,
        include_deleted=True,
    )

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if db_task.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task is not deleted",
        )

    restored_task = tasks_repository.restore_task(db, task_id, current_user.id)

    return restored_task