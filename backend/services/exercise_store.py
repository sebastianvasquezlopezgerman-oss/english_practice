import json
from pathlib import Path
from uuid import uuid4
from typing import Optional

try:
    from backend.schemas import ExerciseCreate
except ModuleNotFoundError:
    from schemas import ExerciseCreate


class ExerciseStore:
    def __init__(self, storage_path: Optional[str] = None) -> None:
        default_path = Path(__file__).resolve().parent.parent / "data" / "exercises.json"
        self._storage_path = Path(storage_path) if storage_path else default_path
        self._exercises: dict[str, dict] = {}
        self._load_or_seed()

    def _load_or_seed(self) -> None:
        if not self._storage_path.exists():
            self._seed_data()
            self._save()
            return

        try:
            data = json.loads(self._storage_path.read_text(encoding="utf-8"))
            if isinstance(data, list):
                self._exercises = {
                    exercise["id"]: exercise for exercise in data if isinstance(exercise, dict) and exercise.get("id")
                }
        except (json.JSONDecodeError, OSError):
            self._exercises = {}

        if not self._exercises:
            self._seed_data()
            self._save()

    def _save(self) -> None:
        self._storage_path.parent.mkdir(parents=True, exist_ok=True)
        payload = list(self._exercises.values())
        self._storage_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _seed_data(self) -> None:
        sample_id = str(uuid4())
        self._exercises[sample_id] = {
            "id": sample_id,
            "title": "Simple Present Tense",
            "instructions": "Fill in each blank with the correct verb form.",
            "items": [
                {
                    "prompt_template": "She ___ to school every day.",
                    "blanks": [{"position": 0, "accepted_answers": ["goes"]}],
                },
                {
                    "prompt_template": "They ___ soccer on Saturdays.",
                    "blanks": [{"position": 0, "accepted_answers": ["play"]}],
                },
            ],
        }

    def list(self) -> list[dict]:
        return list(self._exercises.values())

    def get(self, exercise_id: str) -> Optional[dict]:
        return self._exercises.get(exercise_id)

    def create(self, payload: ExerciseCreate) -> dict:
        exercise_id = str(uuid4())
        data = payload.model_dump()
        data["id"] = exercise_id
        self._exercises[exercise_id] = data
        self._save()
        return data

    def update(self, exercise_id: str, payload: ExerciseCreate) -> Optional[dict]:
        if exercise_id not in self._exercises:
            return None
        data = payload.model_dump()
        data["id"] = exercise_id
        self._exercises[exercise_id] = data
        self._save()
        return data

    def delete(self, exercise_id: str) -> bool:
        if exercise_id not in self._exercises:
            return False
        del self._exercises[exercise_id]
        self._save()
        return True
