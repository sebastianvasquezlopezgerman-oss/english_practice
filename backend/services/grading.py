try:
    from backend.schemas import GradeResponse, GradedItem
except ModuleNotFoundError:
    from schemas import GradeResponse, GradedItem


def normalize_answer(value: str) -> str:
    return value.strip().lower()


def is_correct_answer(student_answer: str, accepted_answers: list[str]) -> bool:
    normalized_student = normalize_answer(student_answer)
    return any(normalized_student == normalize_answer(answer) for answer in accepted_answers)


def grade_submission(exercise: dict, student_name: str, answers: list[str]) -> GradeResponse:
    graded_items: list[GradedItem] = []
    score = 0

    for index, item in enumerate(exercise["items"]):
        student_answer = answers[index] if index < len(answers) else ""
        accepted_answers = item["blanks"][0]["accepted_answers"]
        item_correct = is_correct_answer(student_answer, accepted_answers)
        if item_correct:
            score += 1

        graded_items.append(
            GradedItem(
                prompt_template=item["prompt_template"],
                student_answer=student_answer,
                is_correct=item_correct,
                accepted_answers=accepted_answers,
            )
        )

    return GradeResponse(
        exercise_id=exercise["id"],
        student_name=student_name,
        score=score,
        total=len(exercise["items"]),
        graded_items=graded_items,
    )
