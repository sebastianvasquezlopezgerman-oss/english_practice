import { useState } from "react";
import { api } from "../api/client";
import ExerciseForm from "../components/ExerciseForm";

export default function TeacherView({ exercises, onRefresh }) {
  const [editingExercise, setEditingExercise] = useState(null);
  const [moduleJsonText, setModuleJsonText] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleCreate(payload) {
    try {
      await api.createExercise(payload);
      setInfo("Exercise created.");
      setError("");
      await onRefresh();
      setEditingExercise(null);
    } catch (createError) {
      setError(createError.message || "Could not create exercise.");
    }
  }

  async function handleUpdate(payload) {
    if (!editingExercise) {
      return;
    }
    try {
      await api.updateExercise(editingExercise.id, payload);
      setInfo("Exercise updated.");
      setError("");
      await onRefresh();
      setEditingExercise(null);
    } catch (updateError) {
      setError(updateError.message || "Could not update exercise.");
    }
  }

  async function handleDelete(exerciseId) {
    try {
      await api.deleteExercise(exerciseId);
      setInfo("Exercise deleted.");
      setError("");
      await onRefresh();
      if (editingExercise?.id === exerciseId) {
        setEditingExercise(null);
      }
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete exercise.");
    }
  }

  async function handleImportModule() {
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(moduleJsonText);
    } catch (_parseError) {
      setError("Invalid JSON format.");
      setInfo("");
      return;
    }

    try {
      await api.importModule(parsedPayload);
      setInfo("Module imported.");
      setError("");
      setModuleJsonText("");
      await onRefresh();
    } catch (importError) {
      setError(importError.message || "Could not import module.");
      setInfo("");
    }
  }

  return (
    <section className="teacher-layout">
      <div className="card">
        <h2>Teacher Panel</h2>
        <button className="secondary" onClick={() => setEditingExercise(null)}>
          New Exercise
        </button>
        <h3>Import Module JSON</h3>
        <p className="muted">
          Format: title, instructions, and questions (each with prompt_template and
          accepted_answers).
        </p>
        <textarea
          rows={10}
          value={moduleJsonText}
          onChange={(event) => setModuleJsonText(event.target.value)}
          placeholder={`{
  "title": "Past Tense Module",
  "instructions": "Complete each sentence.",
  "questions": [
    { "prompt_template": "I ___ to the park yesterday.", "accepted_answers": ["went"] },
    { "prompt_template": "They ___ dinner at 7 PM.", "accepted_answers": ["ate", "had"] }
  ]
}`}
        />
        <button onClick={handleImportModule}>Import Module</button>
        <ul className="exercise-list">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <span>{exercise.title}</span>
              <div className="actions-inline">
                <button className="secondary" onClick={() => setEditingExercise(exercise)}>
                  Edit
                </button>
                <button className="danger" onClick={() => handleDelete(exercise.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ExerciseForm
        initialExercise={editingExercise}
        onSubmit={editingExercise ? handleUpdate : handleCreate}
        onCancel={() => setEditingExercise(null)}
      />

      {error ? <p className="error">{error}</p> : null}
      {info ? <p className="info">{info}</p> : null}
    </section>
  );
}
