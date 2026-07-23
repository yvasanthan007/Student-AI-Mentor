import { useState, useRef, useEffect } from "react";
import api from "../services/api";

const CAREER_PROMPT_PREFIX = "You are CareerBot, a career guidance AI for engineering students.";

const QUICK_TOPICS = [
  { icon: "💼", label: "Placement Prep", question: "How should I prepare for campus placements?" },
  { icon: "📝", label: "Resume Tips", question: "Give me tips to build a strong resume for tech jobs" },
  { icon: "🎯", label: "Interview Skills", question: "What are the best interview preparation strategies?" },
  { icon: "🚀", label: "Career Paths", question: "What career paths are available for CSE students?" },
  { icon: "📚", label: "Higher Studies", question: "Should I pursue MS or MBA after engineering?" },
  { icon: "💡", label: "Skill Building", question: "What skills should I develop to be job-ready?" },
];

const CAREER_RESOURCES = [
  {
    category: "Coding Practice",
    items: [
      { name: "LeetCode", desc: "1000+ problems for interview prep", link: "https://leetcode.com" },
      { name: "HackerRank", desc: "Practice coding challenges", link: "https://hackerrank.com" },
      { name: "Codeforces", desc: "Competitive programming", link: "https://codeforces.com" },
    ],
  },
  {
    category: "Learning Platforms",
    items: [
      { name: "Coursera", desc: "University-level courses", link: "https://coursera.org" },
      { name: "Udemy", desc: "Affordable tech courses", link: "https://udemy.com" },
      { name: "freeCodeCamp", desc: "Free coding bootcamp", link: "https://freecodecamp.org" },
    ],
  },
  {
    category: "Job Portals",
    items: [
      { name: "LinkedIn", desc: "Professional networking", link: "https://linkedin.com" },
      { name: "Naukri", desc: "India's top job portal", link: "https://naukri.com" },
      { name: "Indeed", desc: "Global job search", link: "https://indeed.com" },
    ],
  },
];

export default function CareerAssistant({ user, dashboard }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello${user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋 I'm your Career Assistant. I can help you with:\n\n• **Placement preparation** and interview tips\n• **Resume building** and portfolio advice\n• **Career path** guidance for CSE students\n• **Higher studies** options (MS, MBA, PhD)\n• **Skill development** recommendations\n• **Industry trends** and job market insights\n\nWhat would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post("/chat", {
        message: `[Career Guidance Context] ${trimmed}`,
        history,
      });

      setMessages([
        ...newMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment. In the meantime, check out the career resources on the right panel!",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };

  const handleQuickTopic = (question) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const stats = dashboard?.subject_scores || [];
  const avgScore = dashboard?.overview?.average_score || 0;

  return (
    <div className="career-container">
      <div className="career-layout">
        {/* Main chat area */}
        <div className="career-chat-section">
          <div className="career-header">
            <div className="career-header-icon">🎯</div>
            <div>
              <h2>Career Assistant</h2>
              <p>Your AI-powered career guidance companion</p>
            </div>
          </div>

          {/* Quick topics */}
          <div className="career-quick-topics">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                className="career-topic-btn"
                onClick={() => handleQuickTopic(topic.question)}
              >
                <span className="topic-icon">{topic.icon}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>

          <div className="career-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                <div className={`chat-avatar ${msg.role}`}>
                  {msg.role === "assistant" ? "🎯" : (user?.name?.[0] || "U")}
                </div>
                <div className={`chat-bubble-content ${msg.role}`}>
                  <div className="chat-sender">
                    {msg.role === "assistant" ? "CareerBot" : "You"}
                  </div>
                  <div className="chat-text">{msg.content}</div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="chat-bubble assistant">
                <div className="chat-avatar assistant">🎯</div>
                <div className="chat-bubble-content assistant">
                  <div className="chat-sender">CareerBot</div>
                  <div className="chat-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              placeholder="Ask about careers, placements, interviews..."
              rows={1}
              disabled={sending}
            />
            <button
              type="submit"
              className="chat-send-btn career-send"
              disabled={sending || !input.trim()}
            >
              {sending ? "..." : "➤"}
            </button>
          </form>
        </div>

        {/* Right panel: Profile + Resources */}
        <div className="career-side-panel">
          {/* Career readiness card */}
          <div className="career-readiness-card">
            <h3>Career Readiness</h3>
            <div className="readiness-score">
              <div className="readiness-circle">
                <span className="readiness-value">{Math.min(100, Math.round(avgScore * 0.9 + 10))}</span>
                <span className="readiness-max">/100</span>
              </div>
              <div className="readiness-label">
                {avgScore >= 75 ? "Strong Profile" : avgScore >= 60 ? "Good Profile" : "Needs Work"}
              </div>
            </div>

            <div className="readiness-breakdown">
              <div className="rb-item">
                <span className="rb-label">Academic Score</span>
                <span className="rb-value">{avgScore}%</span>
              </div>
              <div className="rb-item">
                <span className="rb-label">Subjects Passed</span>
                <span className="rb-value">{stats.filter(s => s.score >= 40).length}/{stats.length}</span>
              </div>
              <div className="rb-item">
                <span className="rb-label">Strongest Subject</span>
                <span className="rb-value">{stats.length ? stats.reduce((a, b) => a.score > b.score ? a : b).subject : "-"}</span>
              </div>
            </div>
          </div>

          {/* Career Resources */}
          <div className="career-resources">
            <button
              className="resources-toggle"
              onClick={() => setShowResources(!showResources)}
            >
              <span>📚 Career Resources</span>
              <span className="toggle-arrow">{showResources ? "▲" : "▼"}</span>
            </button>

            {showResources && CAREER_RESOURCES.map((group) => (
              <div className="resource-group" key={group.category}>
                <h4>{group.category}</h4>
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    className="resource-link"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="resource-name">{item.name}</span>
                    <span className="resource-desc">{item.desc}</span>
                    <span className="resource-arrow">→</span>
                  </a>
                ))}
              </div>
            ))}
          </div>

          {/* Skills Checklist */}
          <div className="career-checklist">
            <h3>Skills Checklist</h3>
            {[
              { skill: "Data Structures & Algorithms", level: 70 },
              { skill: "Object-Oriented Programming", level: 75 },
              { skill: "Database Management", level: 55 },
              { skill: "Web Development", level: 60 },
              { skill: "System Design", level: 40 },
              { skill: "Communication Skills", level: 65 },
            ].map((item) => (
              <div className="checklist-item" key={item.skill}>
                <div className="checklist-header">
                  <span>{item.skill}</span>
                  <span className="checklist-pct">{item.level}%</span>
                </div>
                <div className="checklist-bar-bg">
                  <div
                    className="checklist-bar-fill"
                    style={{
                      width: `${item.level}%`,
                      background: item.level >= 70 ? "#22c55e" : item.level >= 50 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
