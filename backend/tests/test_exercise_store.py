from pathlib import Path

from backend.schemas import ExerciseCreate
from backend.services.exercise_store import ExerciseStore


def test_store_persists_exercises_to_json(tmp_path: Path) -> None:
    storage_file = tmp_path / "exercises.json"
    store = ExerciseStore(storage_path=str(storage_file))

    created = store.create(
        ExerciseCreate(
            title="Persistence Test",
            instructions="Test instructions",
            items=[
                {
                    "prompt_template": "I ___ coding.",
                    "blanks": [{"position": 0, "accepted_answers": ["love"]}],
                }
            ],
        )
    )

    reloaded_store = ExerciseStore(storage_path=str(storage_file))
    loaded = reloaded_store.get(created["id"])

    assert loaded is not None
    assert loaded["title"] == "Persistence Test"
