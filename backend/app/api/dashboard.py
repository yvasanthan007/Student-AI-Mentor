from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
def get_dashboard():

    return {

        "student":"John Doe",

        "cgpa":8.2,

        "attendance":92,

        "weak_subject":"Mathematics",

        "strong_subject":"Python",

        "tasks":5,

        "completed":2

    }