import { useMemo } from "react";

const SUBJECT_DETAILS = {
  PDS: {
    full_name: "Programming & Data Structures",
    description: "Fundamentals of programming using C/C++, arrays, linked lists, stacks, queues, trees, and graph algorithms.",
    topics: ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees (BST, AVL)", "Graphs (BFS, DFS)", "Sorting & Searching"],
    credits: 4,
    icon: "⟨⟩",
    color: "#22c55e",
  },
  ADS: {
    full_name: "Advanced Data Structures",
    description: "Advanced tree structures, hashing, heap structures, balanced trees, and algorithmic problem solving.",
    topics: ["Red-Black Trees", "B-Trees & B+ Trees", "Hashing Techniques", "Heap Structures", "Trie & Suffix Trees", "Amortized Analysis"],
    credits: 4,
    icon: "🌳",
    color: "#3b82f6",
  },
  DAA: {
    full_name: "Design & Analysis of Algorithms",
    description: "Algorithm design paradigms including divide-and-conquer, dynamic programming, greedy methods, and NP-completeness.",
    topics: ["Divide & Conquer", "Dynamic Programming", "Greedy Algorithms", "Backtracking", "Branch & Bound", "NP-Completeness"],
    credits: 4,
    icon: "⚡",
    color: "#f59e0b",
  },
  DBMS: {
    full_name: "Database Management Systems",
    description: "Relational model, SQL, normalization, transaction management, concurrency control, and database design.",
    topics: ["ER Modeling", "SQL & Relational Algebra", "Normalization (1NF–BCNF)", "Transactions & ACID", "Indexing & Query Optimization", "NoSQL Basics"],
    credits: 4,
    icon: "🗄",
    color: "#a855f7",
  },
  AJP: {
    full_name: "Advanced Java Programming",
    description: "Object-oriented programming with Java, servlets, JSP, JDBC, REST APIs, and enterprise application development.",
    topics: ["OOP with Java", "Exception Handling", "Servlets & JSP", "JDBC & Database Connectivity", "RESTful Web Services", "Spring Framework Basics"],
    credits: 3,
    icon: "☕",
    color: "#ef4444",
  },
  OOPS: {
    full_name: "Object Oriented Programming Systems",
    description: "Principles of OOP including encapsulation, inheritance, polymorphism, abstraction, and design patterns.",
    topics: ["Classes & Objects", "Inheritance & Polymorphism", "Abstraction & Interfaces", "Exception Handling", "File I/O", "Design Patterns (Singleton, Factory)"],
    credits: 3,
    icon: "🔷",
    color: "#06b6d4",
  },
};

export default function Courses({ dashboard }) {
  const courses = useMemo(() => {
    const scores = dashboard?.subject_scores || [];
    return Object.entries(SUBJECT_DETAILS).map(([code, details]) => {
      const scoreData = scores.find((s) => s.subject === code);
      return {
        code,
        ...details,
        score: scoreData?.score || 0,
        grade: scoreData?.grade || "-",
      };
    });
  }, [dashboard]);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const avgScore =
    courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.score, 0) / courses.length)
      : 0;
  const passedCount = courses.filter((c) => c.score >= 40).length;

  const getPerformanceLabel = (score) => {
    if (score >= 85) return { label: "Excellent", className: "course-perf excellent" };
    if (score >= 70) return { label: "Very Good", className: "course-perf very-good" };
    if (score >= 55) return { label: "Good", className: "course-perf good" };
    if (score >= 40) return { label: "Average", className: "course-perf average" };
    return { label: "Needs Work", className: "course-perf needs-work" };
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <div>
          <h2>Your Courses</h2>
          <p>Current semester subjects and performance overview</p>
        </div>
      </div>

      <div className="courses-summary">
        <div className="summary-card">
          <div className="summary-value">{courses.length}</div>
          <div className="summary-label">Total Courses</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{totalCredits}</div>
          <div className="summary-label">Total Credits</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{avgScore}%</div>
          <div className="summary-label">Average Score</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{passedCount}/{courses.length}</div>
          <div className="summary-label">Passed</div>
        </div>
      </div>

      <div className="courses-grid">
        {courses.map((course) => {
          const perf = getPerformanceLabel(course.score);
          return (
            <div className="course-card" key={course.code}>
              <div className="course-card-header" style={{ borderColor: course.color }}>
                <div className="course-icon" style={{ background: course.color + "22", color: course.color }}>
                  {course.icon}
                </div>
                <div className="course-title-group">
                  <h3>{course.code}</h3>
                  <p className="course-full-name">{course.full_name}</p>
                </div>
                <div className="course-credits">{course.credits} Cr</div>
              </div>

              <p className="course-description">{course.description}</p>

              <div className="course-score-section">
                <div className="course-score-bar-bg">
                  <div
                    className="course-score-bar-fill"
                    style={{
                      width: `${Math.min(100, course.score)}%`,
                      background: course.color,
                    }}
                  />
                </div>
                <div className="course-score-details">
                  <span className="course-score-value">{course.score}%</span>
                  <span className="course-grade">Grade: {course.grade}</span>
                  <span className={perf.className}>{perf.label}</span>
                </div>
              </div>

              <div className="course-topics">
                <h4>Key Topics</h4>
                <div className="topic-tags">
                  {course.topics.map((topic) => (
                    <span className="topic-tag" key={topic}>{topic}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
