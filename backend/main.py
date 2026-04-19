import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.schemas import (
        Exercise,
        ExerciseCreate,
        GradeRequest,
        GradeResponse,
        ModuleImportRequest,
    )
    from backend.services.exercise_store import ExerciseStore
    from backend.services.grading import grade_submission
except ModuleNotFoundError:
    # Allow running as a direct script: `python backend/main.py`
    from schemas import (
        Exercise,
        ExerciseCreate,
        GradeRequest,
        GradeResponse,
        ModuleImportRequest,
    )
    from services.exercise_store import ExerciseStore
    from services.grading import grade_submission

app = FastAPI(title="English Practice API")
store = ExerciseStore(storage_path=os.getenv("EXERCISE_STORE_FILE"))

# Support localhost and common LAN ranges so students can open the app
# from another device on the same network.
allowed_origin_regex = (
    r"http://("
    r"localhost|127\.0\.0\.1|"
    r"192\.168\.\d+\.\d+|"
    r"10\.\d+\.\d+\.\d+|"
    r"172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+"
    r")(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/exercises", response_model=list[Exercise])
def list_exercises() -> list[dict]:
    return store.list()


@app.get("/exercises/{exercise_id}", response_model=Exercise)
def get_exercise(exercise_id: str) -> dict:
    exercise = store.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise


@app.post("/exercises", response_model=Exercise, status_code=201)
def create_exercise(payload: ExerciseCreate) -> dict:
    return store.create(payload)


@app.put("/exercises/{exercise_id}", response_model=Exercise)
def update_exercise(exercise_id: str, payload: ExerciseCreate) -> dict:
    exercise = store.update(exercise_id, payload)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise


@app.delete("/exercises/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: str) -> None:
    deleted = store.delete(exercise_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Exercise not found")


@app.post("/exercises/{exercise_id}/grade", response_model=GradeResponse)
def grade_exercise(exercise_id: str, payload: GradeRequest) -> GradeResponse:
    exercise = store.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return grade_submission(exercise, payload.student_name, payload.answers)


@app.post("/modules/import", response_model=Exercise, status_code=201)
def import_module(payload: ModuleImportRequest) -> dict:
    exercise_payload = ExerciseCreate(
        title=payload.title,
        instructions=payload.instructions,
        items=[
            {
                "prompt_template": question.prompt_template,
                "blanks": [{"position": 0, "accepted_answers": question.accepted_answers}],
            }
            for question in payload.questions
        ],
    )
    return store.create(exercise_payload)


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
