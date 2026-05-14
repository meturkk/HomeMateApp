from dataclasses import dataclass
from typing import List

@dataclass
class PersonalityScore:
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float

@dataclass
class User:
    user_id: int
    name: str
    answers: List[int] # 25 questions (1-5)
    score: PersonalityScore = None
