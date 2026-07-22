from pathlib import Path
from ai.gemini import ask_gemini


# Load AI prompt
def load_prompt():
    prompt_path = (
        Path(__file__).resolve().parent.parent
        / "prompts"
        / "performance_prompt.txt"
    )

    with open(prompt_path, "r", encoding="utf-8") as file:
        return file.read()


# Local fallback analysis
def local_analyze(student_data):
    report = []

    report.append("📊 MentorAI Performance Analysis\n")

    strong_subjects = []
    weak_subjects = []

    for student in student_data:
        subject = student["Subject"]

        avg_score = (
            student["Test1"]
            + student["Test2"]
            + student["Assignment"]
        ) / 3

        if avg_score >= 75:
            strong_subjects.append(subject)
        else:
            weak_subjects.append(subject)

    report.append(f"✅ Strong Subjects: {', '.join(strong_subjects)}")

    report.append(f"⚠️ Weak Subjects: {', '.join(weak_subjects)}")

    report.append("\n📅 Daily Study Plan")

    for subject in weak_subjects:
        report.append(f"• Practice {subject} for 2 hours")

    report.append("\n🎯 Weekly Goal")

    report.append("• Improve weak subjects by at least 10 marks.")

    report.append("\n💡 Motivation")

    report.append(
        "Consistency beats intensity. Keep learning every day!"
    )

    return "\n".join(report)


# Main AI analysis function
def analyze_student(student_data):

    system_prompt = load_prompt()

    prompt = f"""
{system_prompt}

Student Data:

{student_data}
"""

    response = ask_gemini(prompt)

    if isinstance(response, str) and response.startswith("Gemini API error"):
        print("\n⚠ Gemini unavailable. Using local analysis.\n")
        return local_analyze(student_data)

    return response


# Test the module independently
if __name__ == "__main__":

    sample_data = [
        {
            "Student": "John",
            "Subject": "Python",
            "Test1": 90,
            "Test2": 92,
            "Assignment": 95,
            "Attendance": 95,
        },
        {
            "Student": "John",
            "Subject": "Mathematics",
            "Test1": 45,
            "Test2": 50,
            "Assignment": 52,
            "Attendance": 80,
        },
        {
            "Student": "John",
            "Subject": "DBMS",
            "Test1": 85,
            "Test2": 88,
            "Assignment": 91,
            "Attendance": 94,
        },
    ]

    print("=" * 60)
    print("🎓 MentorAI Performance Analysis")
    print("=" * 60)

    result = analyze_student(sample_data)

    print("\n")
    print(result)