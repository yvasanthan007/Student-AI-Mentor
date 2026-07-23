from __future__ import annotations

import re
import sys
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel, Field

# Ensure the repo root is on sys.path so `ai` package is importable
ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai.gemini import ask_gemini

router = APIRouter()

SYSTEM_PROMPT = """You are MentorAI, a friendly and knowledgeable academic mentor for college students.
You help students with:
- Understanding difficult subjects and concepts
- Creating effective study plans and schedules
- Exam preparation strategies
- Career guidance and course selection
- Time management and productivity tips
- Motivation and dealing with academic stress

Guidelines:
- Be concise but thorough in your responses
- Use encouraging and supportive language
- Provide practical, actionable advice
- When explaining concepts, use simple examples
- Keep responses focused and well-structured
- Use bullet points or numbered lists when appropriate
- If the student asks about something unrelated to academics, gently redirect them
"""


class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


# ── Offline smart fallback responses ──────────────────────────────
FALLBACK_RESPONSES: list[tuple[list[str], str]] = [
    (
        ["normali", "database", "dbms", "sql"],
        "Great question about databases! **Database Normalization** is the process of organizing data to reduce redundancy.\n\n"
        "**Key Normal Forms:**\n"
        "1. **1NF** - Each column contains atomic values, no repeating groups\n"
        "2. **2NF** - 1NF + no partial dependencies (all non-key columns depend on the full primary key)\n"
        "3. **3NF** - 2NF + no transitive dependencies\n"
        "4. **BCNF** - Stronger version of 3NF\n\n"
        "**Example:** If you have a table with (StudentID, CourseID, InstructorName), the instructor depends on the course, not the student. "
        "Split into two tables: (StudentID, CourseID) and (CourseID, InstructorName).\n\n"
        "Need help with SQL queries or other DBMS concepts?",
    ),
    (
        ["sort", "sorting", "algorithm", "bubble", "merge sort", "quick sort"],
        "Let me explain **sorting algorithms** for you!\n\n"
        "**Common Sorting Algorithms:**\n"
        "1. **Bubble Sort** - O(n^2) - Compare adjacent elements and swap\n"
        "2. **Selection Sort** - O(n^2) - Find minimum, place at front\n"
        "3. **Insertion Sort** - O(n^2) - Insert each element in correct position\n"
        "4. **Merge Sort** - O(n log n) - Divide and merge sorted halves\n"
        "5. **Quick Sort** - O(n log n) avg - Pick pivot, partition around it\n\n"
        "**When to use what:**\n"
        "- Small datasets: Insertion sort works great\n"
        "- General purpose: Quick sort (fastest in practice)\n"
        "- Stable sort needed: Merge sort\n\n"
        "Want me to explain any specific algorithm in detail?",
    ),
    (
        ["time management", "study plan", "schedule", "plan"],
        "Here's an effective **study plan strategy:**\n\n"
        "**Pomodoro Technique:**\n"
        "- Study for 25 minutes, then take a 5-minute break\n"
        "- After 4 sessions, take a 15-30 minute break\n\n"
        "**Weekly Planning Tips:**\n"
        "1. List all subjects and their difficulty level\n"
        "2. Allocate more time to weaker subjects\n"
        "3. Mix hard and easy subjects in a day\n"
        "4. Include revision time for previously studied topics\n"
        "5. Keep buffer time for unexpected topics\n\n"
        "**Sample Daily Schedule:**\n"
        "- Morning (2hrs): Hardest subject\n"
        "- Afternoon (2hrs): Practice problems\n"
        "- Evening (1.5hrs): Revision + lighter subjects\n\n"
        "Want me to create a personalized study plan for your subjects?",
    ),
    (
        ["exam", "preparation", "test", "exam tips"],
        "Here are **proven exam preparation strategies:**\n\n"
        "**2 Weeks Before:**\n"
        "- Create summary notes for each subject\n"
        "- Identify weak areas and focus on them\n"
        "- Start solving previous year papers\n\n"
        "**1 Week Before:**\n"
        "- Revise all topics using your summary notes\n"
        "- Take timed mock tests\n"
        "- Focus on frequently asked questions\n\n"
        "**Day Before:**\n"
        "- Light revision only - don't cram new topics\n"
        "- Organize your materials (hall ticket, stationery)\n"
        "- Get 7-8 hours of sleep\n\n"
        "**During Exam:**\n"
        "- Read all questions first, attempt easiest ones first\n"
        "- Manage time: allocate marks-wise\n"
        "- Review answers in last 10 minutes\n\n"
        "Which subject are you preparing for?",
    ),
    (
        ["career", "job", "placement", "interview", "resume"],
        "Let's talk about **career preparation:**\n\n"
        "**For Placements:**\n"
        "1. **Aptitude** - Practice quantitative, logical, and verbal reasoning daily\n"
        "2. **Coding** - Solve 2-3 problems daily on LeetCode/HackerRank\n"
        "3. **Core Subjects** - Focus on DSA, DBMS, OS, CN, OOPs\n"
        "4. **Projects** - Have 2-3 solid projects on your resume\n\n"
        "**Interview Tips:**\n"
        "- Prepare a 2-minute self-introduction\n"
        "- Use STAR method for behavioral questions (Situation, Task, Action, Result)\n"
        "- Think aloud during coding rounds\n"
        "- Ask thoughtful questions at the end\n\n"
        "**Resume Essentials:**\n"
        "- Keep it to 1 page\n"
        "- Highlight skills, projects, and achievements\n"
        "- Use action verbs and quantify results\n\n"
        "What specific career path are you interested in?",
    ),
    (
        ["stress", "anxiety", "motivation", "overwhelm", "pressure", "burnout"],
        "I hear you - academic pressure can be really challenging. Here's some advice:\n\n"
        "**Managing Academic Stress:**\n"
        "1. **Break tasks into smaller pieces** - Large tasks feel less overwhelming when divided\n"
        "2. **Set realistic goals** - Don't try to cover everything in one day\n"
        "3. **Take breaks** - Your brain needs rest to consolidate learning\n"
        "4. **Exercise** - Even 20 minutes of walking helps reduce stress\n"
        "5. **Talk to someone** - Friends, family, or counselors can help\n\n"
        "**When you feel unmotivated:**\n"
        "- Start with just 5 minutes - momentum builds motivation\n"
        "- Remember your 'why' - what goal are you working towards?\n"
        "- Celebrate small wins\n"
        "- Change your study environment\n\n"
        "Remember: It's okay to have tough days. What matters is consistency over time. You've got this! 💪",
    ),
    (
        ["data structure", "dsa", "linked list", "tree", "graph", "stack", "queue"],
        "**Data Structures** are fundamental to computer science! Here's an overview:\n\n"
        "**Linear:**\n"
        "- **Array** - Fixed size, O(1) access\n"
        "- **Linked List** - Dynamic size, O(n) access, O(1) insertion\n"
        "- **Stack** - LIFO, push/pop in O(1)\n"
        "- **Queue** - FIFO, enqueue/dequeue in O(1)\n\n"
        "**Non-Linear:**\n"
        "- **Tree** - Hierarchical, BST gives O(log n) search\n"
        "- **Graph** - Network of nodes, BFS/DFS traversal\n"
        "- **Heap** - Priority queue, O(1) min/max access\n"
        "- **Hash Table** - O(1) average lookup\n\n"
        "**When to use what:**\n"
        "- Need fast search? → Hash Table or BST\n"
        "- Need ordered data? → Balanced BST\n"
        "- Need shortest path? → Graph (Dijkstra/BFS)\n\n"
        "Which data structure would you like to explore deeper?",
    ),
    (
        ["oop", "object oriented", "class", "inheritance", "polymorphism", "encapsulation"],
        "**Object-Oriented Programming (OOP)** has four main pillars:\n\n"
        "**1. Encapsulation**\n"
        "- Bundle data and methods together in a class\n"
        "- Use access modifiers (private, protected, public)\n"
        "- Example: A BankAccount class with private balance and public deposit()\n\n"
        "**2. Inheritance**\n"
        "- Child class inherits properties from parent class\n"
        "- Promotes code reuse\n"
        "- Example: Dog extends Animal\n\n"
        "**3. Polymorphism**\n"
        "- Same method name, different behaviors\n"
        "- Method overloading (compile-time) and overriding (run-time)\n\n"
        "**4. Abstraction**\n"
        "- Hide implementation details, show only essentials\n"
        "- Use abstract classes and interfaces\n\n"
        "These principles help write clean, maintainable, and scalable code. Want examples in Java or Python?",
    ),
    (
        ["design pattern", "pattern", "singleton", "factory", "observer"],
        "**Design Patterns** are reusable solutions to common software design problems:\n\n"
        "**Creational Patterns:**\n"
        "- **Singleton** - Only one instance of a class\n"
        "- **Factory** - Create objects without specifying exact class\n"
        "- **Builder** - Construct complex objects step by step\n\n"
        "**Structural Patterns:**\n"
        "- **Adapter** - Convert interface of a class to another interface\n"
        "- **Decorator** - Add behavior dynamically\n"
        "- **Facade** - Simplified interface to a complex system\n\n"
        "**Behavioral Patterns:**\n"
        "- **Observer** - Notify dependents of state changes\n"
        "- **Strategy** - Define interchangeable algorithms\n"
        "- **Command** - Encapsulate a request as an object\n\n"
        "These patterns help you write flexible and maintainable code. Which pattern would you like to dive deeper into?",
    ),
    (
        ["hello", "hi", "hey", "good morning", "how are you"],
        "Hello! 👋 I'm MentorAI, your academic mentor. I'm here to help you with:\n\n"
        "- 📚 **Understanding subjects** - PDS, ADS, DAA, DBMS, AJP, OOPS\n"
        "- 📝 **Study planning** - Create effective schedules\n"
        "- 🎯 **Exam preparation** - Strategies and tips\n"
        "- 💼 **Career guidance** - Placements and interviews\n"
        "- ⏰ **Time management** - Productivity techniques\n"
        "- 🧠 **Academic stress** - Motivation and wellbeing\n\n"
        "What would you like help with today?",
    ),
    (
        ["thank", "thanks", "helpful", "great"],
        "You're welcome! 😊 I'm glad I could help. Remember, consistent effort beats perfection every time. "
        "Feel free to ask me anything else about your studies, career, or academic life. I'm always here to support you!",
    ),
]

DEFAULT_FALLBACK = (
    "That's a great question! Let me share some thoughts:\n\n"
    "While I'm currently running in offline mode, here are some general tips:\n\n"
    "1. **Break down** the topic into smaller, manageable concepts\n"
    "2. **Look for examples** and practical applications\n"
    "3. **Practice regularly** - solving problems reinforces understanding\n"
    "4. **Discuss with peers** - teaching others helps solidify your knowledge\n\n"
    "Try asking me about specific subjects like **DBMS, Data Structures, OOP, Algorithms**, "
    "or topics like **study planning, exam prep, career guidance** - I have detailed responses for those!\n\n"
    "What else can I help you with?"
)


def _get_offline_reply(message: str) -> str:
    """Match user message against fallback response keywords."""
    lower = message.lower()
    best_match = ""
    best_score = 0
    for keywords, response in FALLBACK_RESPONSES:
        score = sum(1 for kw in keywords if kw in lower)
        if score > best_score:
            best_score = score
            best_match = response
    return best_match if best_score > 0 else DEFAULT_FALLBACK


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    # Build conversation context from history
    context_parts = [SYSTEM_PROMPT]

    # Include last 20 messages for context
    recent_history = payload.history[-20:]
    for msg in recent_history:
        if msg.role == "user":
            context_parts.append(f"Student: {msg.content}")
        else:
            context_parts.append(f"MentorAI: {msg.content}")

    context_parts.append(f"Student: {payload.message}")
    context_parts.append("MentorAI:")

    prompt = "\n".join(context_parts)

    try:
        reply = ask_gemini(prompt)
        reply = reply.strip()
        if not reply:
            reply = _get_offline_reply(payload.message)
    except Exception as exc:
        reply = _get_offline_reply(payload.message)
        print(f"[Chat] Using offline fallback: {exc}")

    return ChatResponse(reply=reply)
