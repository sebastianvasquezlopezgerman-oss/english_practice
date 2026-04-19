import { useEffect, useState } from "react";
import StudentView from "./pages/StudentView";
import TeacherView from "./pages/TeacherView";
import { api } from "./api/client";

export default function App() {
  const [view, setView] = useState("student");
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState("");

  async function loadExercises() {
    try {
      const data = await api.listExercises();
      setExercises(data);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Could not load exercises.");
    }
  }

  useEffect(() => {
    loadExercises();
  }, []);

  return (
    <main className="app-shell">
      <header>
        <h1>English Fill-in-the-Blank Practice</h1>
        <p className="muted">Students complete exercises and see correct answers instantly.</p>
      </header>

      <nav className="tabs">
        <button className={view === "student" ? "active" : ""} onClick={() => setView("student")}>
          Student
        </button>
        <button className={view === "teacher" ? "active" : ""} onClick={() => setView("teacher")}>
          Teacher
        </button>
      </nav>

      {error ? <p className="error">{error}</p> : null}

      {view === "student" ? (
        <StudentView exercises={exercises} />
      ) : (
        <TeacherView exercises={exercises} onRefresh={loadExercises} />
      )}
    </main>
  );
}
