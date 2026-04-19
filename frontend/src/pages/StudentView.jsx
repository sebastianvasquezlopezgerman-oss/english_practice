import { useMemo, useState } from "react";
import { api } from "../api/client";

export default function StudentView({ exercises }) {
  const [studentName, setStudentName] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) || null,
    [exercises, selectedExerciseId]
  );

  function startExercise() {
    if (!selectedExercise) {
      return;
    }
    setAnswers(new Array(selectedExercise.items.length).fill(""));
    setResult(null);
    setError("");
  }

  function updateAnswer(index, value) {
    const nextAnswers = [...answers];
    nextAnswers[index] = value;
    setAnswers(nextAnswers);
  }

  async function submitAnswers() {
    if (!studentName.trim() || !selectedExerciseId) {
      setError("Enter your name and select an exercise.");
      return;
    }

    try {
      const graded = await api.gradeExercise(selectedExerciseId, {
        student_name: studentName.trim(),
        answers,
      });
      setResult(graded);
      setError("");
    } catch (submitError) {
      setError(submitError.message || "Could not submit answers.");
    }
  }

  return (
    <section className="card">
      <h2>Student Practice</h2>
      <label>Your Name</label>
      <input value={studentName} onChange={(event) => setStudentName(event.target.value)} />

      <label>Choose Exercise</label>
      <select
        value={selectedExerciseId}
        onChange={(event) => {
          setSelectedExerciseId(event.target.value);
          setAnswers([]);
          setResult(null);
        }}
      >
        <option value="">Select...</option>
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.title}
          </option>
        ))}
      </select>

      <button onClick={startExercise} disabled={!selectedExerciseId}>
        Start
      </button>

      {selectedExercise && answers.length > 0 ? (
        <div className="exercise-area">
          <p className="muted">{selectedExercise.instructions}</p>
          {selectedExercise.items.map((item, index) => (
            <div key={index} className="exercise-row">
              <span>{item.prompt_template}</span>
              <input
                value={answers[index] || ""}
                onChange={(event) => updateAnswer(index, event.target.value)}
                placeholder="Your answer"
              />
            </div>
          ))}

          <button onClick={submitAnswers}>Submit Answers</button>
        </div>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <div className="results">
          <h3>
            Score: {result.score}/{result.total}
          </h3>
          {result.graded_items.map((item, index) => (
            <div key={index} className={item.is_correct ? "correct" : "incorrect"}>
              <strong>{item.prompt_template}</strong>
              <p>Your answer: {item.student_answer || "(blank)"}</p>
              <p>Correct answer(s): {item.accepted_answers.join(", ")}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
