from flask import request
from datetime import date, datetime, timezone, timedelta
from sqlalchemy import select, func
from app import db
from app.models import StudyPlan, StudyTask
from app.utils import success_res, error_res
from app.config import get_ai_plan


def get_dashboard_func():
    body = request.get_json() or {}
    user_id = body.get("user_id")
    if not user_id:
        return error_res("user_id required", 400)
 
    today      = date.today()
    today_str  = today.isoformat()
 
    all_tasks = db.session.execute(
        select(StudyTask).where(StudyTask.user_id == user_id)
    ).scalars().all()
 
    if not all_tasks:
        return success_res("Dashboard data fetched", data={
            "overview": {"total": 0, "completed": 0, "backlog": 0, "skipped": 0, "completion_pct": 0},
            "streak": {"current": 0, "longest": 0},
            "today": {"tasks": [], "completed": 0, "total": 0},
            "upcoming": [],
            "last_14_days": [],
            "subject_progress": [],
            "weekly_comparison": {"this_week": 0, "last_week": 0},
        })
 
    total     = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.status == "completed")
    backlog   = sum(1 for t in all_tasks if t.scheduled_date < today_str and t.status == "pending")
    skipped   = sum(1 for t in all_tasks if t.status == "skipped")
    comp_pct  = round((completed / total) * 100) if total else 0
 
    today_tasks = [t for t in all_tasks if t.scheduled_date == today_str]
    today_done  = sum(1 for t in today_tasks if t.status == "completed")
    today_data  = [
        {
            "id":               t.id,
            "subject":          t.subject,
            "topic":            t.topic,
            "task_type":        t.task_type,
            "priority":         t.priority,
            "duration_minutes": t.duration_minutes,
            "status":           t.status,
        }
        for t in today_tasks
    ]
 
    upcoming_days = []
    for i in range(1, 8):
        d_str = (today + timedelta(days=i)).isoformat()
        day_tasks = [t for t in all_tasks if t.scheduled_date == d_str]
        if day_tasks:
            upcoming_days.append({
                "date":  d_str,
                "count": len(day_tasks),
                "subjects": list({t.subject for t in day_tasks}),
                "total_minutes": sum(t.duration_minutes for t in day_tasks),
            })
        if len(upcoming_days) >= 5:
            break
 
    last_14 = []
    for i in range(13, -1, -1):
        d      = today - timedelta(days=i)
        d_str  = d.isoformat()
        d_tasks = [t for t in all_tasks if t.scheduled_date == d_str]
        d_done  = sum(1 for t in d_tasks if t.status == "completed")
        d_total = len(d_tasks)
        last_14.append({
            "date":      d_str,
            "day":       d.strftime("%a"),
            "completed": d_done,
            "total":     d_total,
            "pct":       round((d_done / d_total) * 100) if d_total else 0,
        })
 
    completed_dates = {
        t.scheduled_date for t in all_tasks if t.status == "completed"
    }
 
    current_streak = 0
    check = today
    if today_str not in completed_dates:
        check = today - timedelta(days=1)
 
    while check.isoformat() in completed_dates:
        current_streak += 1
        check -= timedelta(days=1)
 
    all_dates_sorted = sorted(completed_dates)
    longest_streak = 0
    temp = 0
    prev = None
    for d_str in all_dates_sorted:
        d = date.fromisoformat(d_str)
        if prev and (d - prev).days == 1:
            temp += 1
        else:
            temp = 1
        longest_streak = max(longest_streak, temp)
        prev = d
 
    subject_map = {}
    for t in all_tasks:
        s = t.subject
        if s not in subject_map:
            subject_map[s] = {"total": 0, "completed": 0, "minutes_studied": 0}
        subject_map[s]["total"] += 1
        if t.status == "completed":
            subject_map[s]["completed"] += 1
            subject_map[s]["minutes_studied"] += t.duration_minutes
 
    subject_progress = [
        {
            "subject":        s,
            "total":          v["total"],
            "completed":      v["completed"],
            "pct":            round((v["completed"] / v["total"]) * 100) if v["total"] else 0,
            "hours_studied":  round(v["minutes_studied"] / 60, 1),
        }
        for s, v in subject_map.items()
    ]
    subject_progress.sort(key=lambda x: x["pct"], reverse=True)
 
    this_week_start = (today - timedelta(days=today.weekday())).isoformat()
    last_week_start = (today - timedelta(days=today.weekday() + 7)).isoformat()
    last_week_end   = (today - timedelta(days=today.weekday() + 1)).isoformat()
 
    this_week_done = sum(
        1 for t in all_tasks
        if t.status == "completed" and t.scheduled_date >= this_week_start
    )
    last_week_done = sum(
        1 for t in all_tasks
        if t.status == "completed"
        and last_week_start <= t.scheduled_date <= last_week_end
    )
 
    plans_count = db.session.execute(
        select(func.count()).where(StudyPlan.user_id == user_id)
    ).scalar()
 
    return success_res("Dashboard data fetched", data={
        "overview": {
            "total":          total,
            "completed":      completed,
            "backlog":        backlog,
            "skipped":        skipped,
            "completion_pct": comp_pct,
            "plans_count":    plans_count,
        },
        "streak": {
            "current": current_streak,
            "longest": longest_streak,
        },
        "today": {
            "tasks":     today_data,
            "completed": today_done,
            "total":     len(today_tasks),
        },
        "upcoming":          upcoming_days,
        "last_14_days":      last_14,
        "subject_progress":  subject_progress,
        "weekly_comparison": {
            "this_week": this_week_done,
            "last_week": last_week_done,
        },
    })


def generate_plan_func():
    body = request.get_json()
    if not body:
        return error_res("Invalid JSON body", 400)

    plan_title = body.get("planTitle")
    deadline   = body.get("deadline")
    class_val  = body.get("classVal")
    stream     = body.get("stream")
    board      = body.get("board")
    min_hours  = body.get("minHours")
    max_hours  = body.get("maxHours")
    difficulty = body.get("difficulty")
    subjects   = body.get("subjects")
    user_id    = body.get("user_id")

    if not all([plan_title, deadline, class_val, stream, board,
                min_hours, max_hours, difficulty, subjects, user_id]):
        return error_res("Please fill all required fields", 400)

    ai_result = get_ai_plan({
        "plan_title": plan_title,
        "deadline":   deadline,
        "class_val":  class_val,
        "stream":     stream,
        "board":      board,
        "min_hours":  int(min_hours),
        "max_hours":  int(max_hours),
        "difficulty": difficulty,
        "subjects":   subjects,
    })

    if ai_result.get("error"):
        return error_res(ai_result.get("message", "AI generation failed"), 500)

    plan = StudyPlan(
        plan_title=plan_title, deadline=deadline, class_val=class_val,
        stream=stream, board=board, min_hours=int(min_hours),
        max_hours=int(max_hours), difficulty=difficulty,
        subjects=subjects, user_id=user_id,
    )
    db.session.add(plan)
    db.session.flush()

    tasks_to_add = []
    for day_entry in ai_result.get("plan", []):
        day_date = day_entry.get("date")
        day_num  = day_entry.get("day", 1)
        week_num = day_entry.get("week", 1)
        for task in day_entry.get("tasks", []):
            tasks_to_add.append(StudyTask(
                plan_id=plan.id, user_id=user_id,
                subject=task.get("subject", ""),
                topic=task.get("topic", ""),
                task_type=task.get("type", "study"),
                priority=task.get("priority", "medium"),
                duration_minutes=task.get("duration_minutes", 60),
                description=task.get("description"),
                scheduled_date=day_date,
                day_number=day_num, week_number=week_num,
                status="pending",
            ))

    db.session.add_all(tasks_to_add)
    db.session.commit()

    return success_res("Study plan generated successfully", data={
        "plan_id":       plan.id,
        "tasks_created": len(tasks_to_add),
        "strategy":      ai_result.get("strategy"),
        "total_days":    ai_result.get("total_days"),
        "generate_days": ai_result.get("generate_days"),
    })


def get_tasks_func():
    body = request.get_json() or {}
    user_id = body.get("user_id")
    if not user_id:
        return error_res("user_id required", 400)

    today_str = date.today().isoformat()

    plans = db.session.execute(
        select(StudyPlan)
        .where(StudyPlan.user_id == user_id)
        .order_by(StudyPlan.id.desc())
    ).scalars().all()

    result = []
    for plan in plans:
        subjects = [
            row[0] for row in db.session.execute(
                select(StudyTask.subject)
                .where(StudyTask.plan_id == plan.id)
                .distinct()
            ).all()
        ]

        all_tasks = db.session.execute(
            select(StudyTask).where(StudyTask.plan_id == plan.id)
        ).scalars().all()

        total     = len(all_tasks)
        completed = sum(1 for t in all_tasks if t.status == "completed")
        missed    = sum(1 for t in all_tasks
                        if t.scheduled_date < today_str and t.status == "pending")

        result.append({
            "plan_id":    plan.id,
            "plan_title": plan.plan_title,
            "deadline":   plan.deadline,
            "subjects":   subjects,
            "stats":      {"total": total, "completed": completed, "missed": missed},
        })

    return success_res("Plans fetched", data=result)


def get_subject_tasks_func():
    body        = request.get_json() or {}
    user_id     = body.get("user_id")
    plan_id     = body.get("plan_id")
    page        = body.get("page", 1)
    filter_type = body.get("filter", "all")

    if not user_id:
        return error_res("user_id required", 400)

    DAYS_PER_PAGE = 10
    today_str     = date.today().isoformat()

    stmt = select(StudyTask).where(StudyTask.user_id == user_id)

    if plan_id:
        stmt = stmt.where(StudyTask.plan_id == plan_id)

    if filter_type == "today":
        stmt = stmt.where(StudyTask.scheduled_date == today_str)
    elif filter_type == "pending":
        stmt = stmt.where(
            StudyTask.scheduled_date < today_str,
            StudyTask.status == "pending",
        )
    elif filter_type == "completed":
        stmt = stmt.where(StudyTask.status == "completed")
    else:
        stmt = stmt.where(StudyTask.scheduled_date >= today_str)

    stmt      = stmt.order_by(StudyTask.scheduled_date.asc(), StudyTask.id.asc())
    all_tasks = db.session.execute(stmt).scalars().all()

    days_map: dict = {}
    for t in all_tasks:
        key = t.scheduled_date
        if key not in days_map:
            days_map[key] = {
                "date":        key,
                "day_number":  t.day_number,
                "week_number": t.week_number,
                "tasks":       [],
            }
        days_map[key]["tasks"].append({
            "id":               t.id,
            "plan_id":          t.plan_id,
            "subject":          t.subject,
            "topic":            t.topic,
            "task_type":        t.task_type,
            "priority":         t.priority,
            "duration_minutes": t.duration_minutes,
            "description":      t.description,
            "scheduled_date":   t.scheduled_date,
            "day_number":       t.day_number,
            "week_number":      t.week_number,
            "status":           t.status,
        })

    all_days   = list(days_map.values())
    total_days = len(all_days)
    offset     = (page - 1) * DAYS_PER_PAGE
    paginated  = all_days[offset: offset + DAYS_PER_PAGE]

    return success_res("Tasks fetched", data={
        "days":       paginated,
        "total_days": total_days,
        "page":       page,
        "has_more":   (offset + DAYS_PER_PAGE) < total_days,
    })


def update_task_status_func(task_id: int):
    body    = request.get_json()
    status  = body.get("status")
    user_id = body.get("user_id")

    if status not in ("completed", "pending", "skipped"):
        return error_res("Invalid status. Use: completed | pending | skipped", 400)

    task = db.session.execute(
        select(StudyTask)
        .where(StudyTask.id == task_id)
        .where(StudyTask.user_id == user_id)
    ).scalar_one_or_none()

    if not task:
        return error_res("Task not found", 404)

    task.status       = status
    task.completed_at = datetime.now(timezone.utc) if status == "completed" else None
    db.session.commit()

    return success_res("Task status updated", data={"id": task.id, "status": task.status})