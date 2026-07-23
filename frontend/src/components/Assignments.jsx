import { useMemo, useState } from "react";

const ASSIGNMENTS_DATA = [
  {
    id: 1,
    title: "DBMS Normalization Assignment",
    subject: "DBMS",
    description: "Normalize the given unnormalized table to 3NF. Show all intermediate steps and identify functional dependencies.",
    dueDate: "2026-07-25",
    dueLabel: "2 days left",
    status: "pending",
    priority: "high",
    marks: 20,
    type: "Practical",
  },
  {
    id: 2,
    title: "DAA Lab - Dynamic Programming",
    subject: "DAA",
    description: "Implement the Longest Common Subsequence and Matrix Chain Multiplication using dynamic programming. Submit code with test cases.",
    dueDate: "2026-07-27",
    dueLabel: "4 days left",
    status: "pending",
    priority: "high",
    marks: 25,
    type: "Lab",
  },
  {
    id: 3,
    title: "ADS Red-Black Tree Implementation",
    subject: "ADS",
    description: "Implement Red-Black Tree with insert, delete, and search operations. Include tree rotation methods and balance verification.",
    dueDate: "2026-07-29",
    dueLabel: "6 days left",
    status: "pending",
    priority: "medium",
    marks: 30,
    type: "Programming",
  },
  {
    id: 4,
    title: "AJP Servlet & JSP Mini Project",
    subject: "AJP",
    description: "Build a student registration system using Servlets and JSP with JDBC connectivity. Include form validation and error handling.",
    dueDate: "2026-08-02",
    dueLabel: "10 days left",
    status: "in-progress",
    priority: "medium",
    marks: 40,
    type: "Project",
  },
  {
    id: 5,
    title: "OOPS Design Patterns Report",
    subject: "OOPS",
    description: "Write a detailed report on Singleton, Factory, and Observer design patterns with Java code examples and UML diagrams.",
    dueDate: "2026-08-05",
    dueLabel: "13 days left",
    status: "not-started",
    priority: "low",
    marks: 15,
    type: "Report",
  },
  {
    id: 6,
    title: "PDS Linked List Operations",
    subject: "PDS",
    description: "Implement singly and doubly linked lists with operations: insert at position, delete by value, reverse, and merge two sorted lists.",
    dueDate: "2026-08-08",
    dueLabel: "16 days left",
    status: "not-started",
    priority: "low",
    marks: 20,
    type: "Programming",
  },
  {
    id: 7,
    title: "DBMS ER Diagram - Hospital System",
    subject: "DBMS",
    description: "Design a complete ER diagram for a Hospital Management System. Include entities, relationships, cardinality, and attributes.",
    dueDate: "2026-07-24",
    dueLabel: "Tomorrow",
    status: "in-progress",
    priority: "critical",
    marks: 15,
    type: "Design",
  },
  {
    id: 8,
    title: "DAA Sorting Algorithm Comparison",
    subject: "DAA",
    description: "Compare time complexity of Quick Sort, Merge Sort, and Heap Sort empirically. Run tests on datasets of size 1000, 10000, 100000.",
    dueDate: "2026-08-01",
    dueLabel: "9 days left",
    status: "pending",
    priority: "medium",
    marks: 25,
    type: "Lab",
  },
];

const SUBJECT_COLORS = {
  DBMS: "#a855f7",
  DAA: "#f59e0b",
  ADS: "#3b82f6",
  AJP: "#ef4444",
  OOPS: "#06b6d4",
  PDS: "#22c55e",
};

const STATUS_CONFIG = {
  "not-started": { label: "Not Started", color: "#94a3b8", icon: "○" },
  "pending": { label: "Pending", color: "#fbbf24", icon: "◐" },
  "in-progress": { label: "In Progress", color: "#3b82f6", icon: "◑" },
  completed: { label: "Completed", color: "#22c55e", icon: "●" },
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ef4444" },
  high: { label: "High", color: "#f97316" },
  medium: { label: "Medium", color: "#eab308" },
  low: { label: "Low", color: "#22c55e" },
};

export default function Assignments({ dashboard }) {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const deadlines = dashboard?.upcoming_deadlines || [];

  const filtered = useMemo(() => {
    let items = [...ASSIGNMENTS_DATA];
    if (filter !== "all") {
      items = items.filter((a) => a.status === filter);
    }
    if (sortBy === "dueDate") {
      items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "priority") {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      items.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === "subject") {
      items.sort((a, b) => a.subject.localeCompare(b.subject));
    }
    return items;
  }, [filter, sortBy]);

  const stats = useMemo(() => {
    const total = ASSIGNMENTS_DATA.length;
    const completed = ASSIGNMENTS_DATA.filter((a) => a.status === "completed").length;
    const inProgress = ASSIGNMENTS_DATA.filter((a) => a.status === "in-progress").length;
    const pending = ASSIGNMENTS_DATA.filter((a) => a.status === "pending").length;
    const critical = ASSIGNMENTS_DATA.filter((a) => a.priority === "critical" || a.priority === "high").length;
    const totalMarks = ASSIGNMENTS_DATA.reduce((s, a) => s + a.marks, 0);
    return { total, completed, inProgress, pending, critical, totalMarks };
  }, []);

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: "Overdue", urgent: true };
    if (diff === 0) return { text: "Due today!", urgent: true };
    if (diff === 1) return { text: "Tomorrow", urgent: true };
    if (diff <= 3) return { text: `${diff} days left`, urgent: true };
    return { text: `${diff} days left`, urgent: false };
  };

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <div>
          <h2>Assignments & Deadlines</h2>
          <p>Track your upcoming assignments and stay on top of deadlines</p>
        </div>
      </div>

      {/* Quick deadlines from dashboard */}
      {deadlines.length > 0 && (
        <div className="quick-deadlines">
          <h3>⚡ Quick Deadlines</h3>
          <div className="quick-deadline-cards">
            {deadlines.map((d, i) => (
              <div className={`quick-deadline-card flag-${d.flag}`} key={i}>
                <div className="qd-icon">
                  {d.flag === "critical" ? "🔴" : d.flag === "warning" ? "🟡" : "🔵"}
                </div>
                <div className="qd-info">
                  <div className="qd-title">{d.title}</div>
                  <div className="qd-when">{d.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="assignments-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd" }}>📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>🔄</div>
          <div className="stat-info">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>🔥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80" }}>📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalMarks}</div>
            <div className="stat-label">Total Marks</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="assignments-filters">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          {["all", "in-progress", "pending", "not-started"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">Sort:</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="subject">Subject</option>
          </select>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="assignments-list">
        {filtered.map((assignment) => {
          const daysInfo = getDaysLeft(assignment.dueDate);
          const statusCfg = STATUS_CONFIG[assignment.status];
          const priorityCfg = PRIORITY_CONFIG[assignment.priority];
          const subjectColor = SUBJECT_COLORS[assignment.subject] || "#8b5cf6";

          return (
            <div className={`assignment-card priority-${assignment.priority}`} key={assignment.id}>
              <div className="assignment-left-bar" style={{ background: subjectColor }} />
              <div className="assignment-content">
                <div className="assignment-top-row">
                  <div className="assignment-badges">
                    <span className="badge subject-badge" style={{ background: subjectColor + "22", color: subjectColor, borderColor: subjectColor + "44" }}>
                      {assignment.subject}
                    </span>
                    <span className="badge type-badge">{assignment.type}</span>
                    <span className="badge priority-badge" style={{ background: priorityCfg.color + "22", color: priorityCfg.color }}>
                      {priorityCfg.label}
                    </span>
                  </div>
                  <div className="assignment-marks">{assignment.marks} marks</div>
                </div>

                <h3 className="assignment-title">{assignment.title}</h3>
                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-bottom-row">
                  <div className={`assignment-due ${daysInfo.urgent ? "urgent" : ""}`}>
                    <span className="due-icon">{daysInfo.urgent ? "⏰" : "📅"}</span>
                    <span>{daysInfo.text}</span>
                    <span className="due-date">({assignment.dueDate})</span>
                  </div>
                  <div className="assignment-status" style={{ color: statusCfg.color }}>
                    <span>{statusCfg.icon}</span>
                    <span>{statusCfg.label}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>All caught up!</h3>
          <p>No assignments match this filter.</p>
        </div>
      )}
    </div>
  );
}
