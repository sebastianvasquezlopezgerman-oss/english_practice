from pydantic import BaseModel, Field


class Blank(BaseModel):
    position: int
    accepted_answers: list[str] = Field(min_length=1)


class Item(BaseModel):
    prompt_template: str = Field(min_length=1)
    blanks: list[Blank] = Field(min_length=1)


class ExerciseBase(BaseModel):
    title: str = Field(min_length=1)
    instructions: str = Field(default="")
    items: list[Item] = Field(min_length=1)


class ExerciseCreate(ExerciseBase):
    pass


class Exercise(ExerciseBase):
    id: str


class GradeRequest(BaseModel):
    student_name: str = Field(min_length=1)
    answers: list[str]


class GradedItem(BaseModel):
    prompt_template: str
    student_answer: str
    is_correct: bool
    accepted_answers: list[str]


class GradeResponse(BaseModel):
    exercise_id: str
    student_name: str
    score: int
    total: int
    graded_items: list[GradedItem]


class ModuleQuestion(BaseModel):
    prompt_template: str = Field(min_length=1)
    accepted_answers: list[str] = Field(min_length=1)


class ModuleImportRequest(BaseModel):
    title: str = Field(min_length=1)
    instructions: str = Field(default="")
    questions: list[ModuleQuestion] = Field(min_length=1)
