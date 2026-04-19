from backend.services.grading import is_correct_answer


def test_is_correct_answer_case_insensitive() -> None:
    assert is_correct_answer("Goes", ["goes"]) is True


def test_is_correct_answer_supports_multiple_accepted() -> None:
    assert is_correct_answer("colour", ["color", "colour"]) is True


def test_is_correct_answer_rejects_invalid() -> None:
    assert is_correct_answer("went", ["goes"]) is False
