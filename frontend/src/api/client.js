const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  listExercises: () => request("/exercises"),
  createExercise: (payload) =>
    request("/exercises", { method: "POST", body: JSON.stringify(payload) }),
  updateExercise: (id, payload) =>
    request(`/exercises/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteExercise: (id) => request(`/exercises/${id}`, { method: "DELETE" }),
  importModule: (payload) =>
    request("/modules/import", { method: "POST", body: JSON.stringify(payload) }),
  gradeExercise: (id, payload) =>
    request(`/exercises/${id}/grade`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
