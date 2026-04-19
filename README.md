# English Practice App

Simple classroom app for fill-in-the-blank exercises.

## Stack

- Backend: FastAPI
- Frontend: React (Vite)

## Run Backend

```bash
cd backend
../.venv/bin/python -m uvicorn backend.main:app --reload
```

Backend runs on `http://localhost:8000`.

Exercises are persisted at `backend/data/exercises.json` by default, so IDs survive backend restarts.

## Run Frontend

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `GET /health`
- `GET /exercises`
- `GET /exercises/{id}`
- `POST /exercises`
- `PUT /exercises/{id}`
- `DELETE /exercises/{id}`
- `POST /exercises/{id}/grade`
- `POST /modules/import`

### Module JSON import format

Teachers can import a module (with several questions) from JSON:

```json
{
  "title": "Past Tense Module",
  "instructions": "Complete each sentence.",
  "questions": [
    { "prompt_template": "I ___ to the park yesterday.", "accepted_answers": ["went"] },
    { "prompt_template": "They ___ dinner at 7 PM.", "accepted_answers": ["ate", "had"] }
  ]
}
```

## Tests

```bash
PYTHONPATH=$(pwd) .venv/bin/python -m pytest backend/tests
```
