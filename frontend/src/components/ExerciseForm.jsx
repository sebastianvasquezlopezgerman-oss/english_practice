import { useEffect, useState } from "react";

const blankItem = () => ({ prompt_template: "", accepted_answers: "" });

function toFormState(exercise) {
  if (!exercise) {
    return {
      title: "",
      instructions: "",
      items: [blankItem()],
    };
  }

  return {
    title: exercise.title,
    instructions: exercise.instructions,
    items: exercise.items.map((item) => ({
      prompt_template: item.prompt_template,
      accepted_answers: item.blanks[0]?.accepted_answers?.join(", ") || "",
    })),
  };
}

export default function ExerciseForm({ initialExercise, onSubmit, onCancel }) {
  const [form, setForm] = useState(toFormState(initialExercise));

  useEffect(() => {
    setForm(toFormState(initialExercise));
  }, [initialExercise]);

  function updateItem(index, key, value) {
    const nextItems = [...form.items];
    nextItems[index] = { ...nextItems[index], [key]: value };
    setForm({ ...form, items: nextItems });
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, blankItem()] });
  }

  function removeItem(index) {
    const nextItems = form.items.filter((_, itemIndex) => itemIndex !== index);
    setForm({ ...form, items: nextItems.length ? nextItems : [blankItem()] });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      items: form.items
        .filter((item) => item.prompt_template.trim().length > 0)
        .map((item) => ({
          prompt_template: item.prompt_template.trim(),
          blanks: [
            {
              position: 0,
              accepted_answers: item.accepted_answers
                .split(",")
                .map((answer) => answer.trim())
                .filter(Boolean),
            },
          ],
        })),
    };

    onSubmit(payload);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{initialExercise ? "Edit Exercise" : "Create Exercise"}</h3>
      <label>Title</label>
      <input
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        required
      />

      <label>Instructions</label>
      <textarea
        value={form.instructions}
        onChange={(event) => setForm({ ...form, instructions: event.target.value })}
        rows={3}
      />

      <h4>Items</h4>
      {form.items.map((item, index) => (
        <div key={index} className="item-editor">
          <label>Prompt Template</label>
          <input
            value={item.prompt_template}
            onChange={(event) => updateItem(index, "prompt_template", event.target.value)}
            placeholder="Example: She ___ to school every day."
            required
          />
          <label>Accepted Answers (comma separated)</label>
          <input
            value={item.accepted_answers}
            onChange={(event) => updateItem(index, "accepted_answers", event.target.value)}
            placeholder="goes"
            required
          />
          <button type="button" className="secondary" onClick={() => removeItem(index)}>
            Remove Item
          </button>
        </div>
      ))}

      <button type="button" className="secondary" onClick={addItem}>
        Add Item
      </button>

      <div className="actions">
        <button type="submit">Save</button>
        {onCancel ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
