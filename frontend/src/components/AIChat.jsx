import { useState, useRef, useEffect } from "react";
import api from "../services/api";

export default function AIChat({ user }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello${user?.name ? `, ${user.name.split(" ")[0]}` : ""}! I'm MentorAI, your academic mentor. How can I help you today? You can ask me about study strategies, exam preparation, course guidance, or anything academic!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Build history for API (exclude the just-sent user message, it goes in `message`)
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post("/chat", {
        message: trimmed,
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
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
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

  const suggestedQuestions = [
    "How should I prepare for my DBMS exam?",
    "Create a study plan for this week",
    "Explain normalization in databases",
    "Tips to improve my coding skills",
  ];

  const handleSuggestion = (q) => {
    setInput(q);
    textareaRef.current?.focus();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-icon">🤖</div>
        <div>
          <h2>AI Mentor Chat</h2>
          <p>Ask me anything about your academics, study strategies, or career guidance</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === "assistant" ? "🤖" : (user?.name?.[0] || "U")}
            </div>
            <div className={`chat-bubble-content ${msg.role}`}>
              <div className="chat-sender">
                {msg.role === "assistant" ? "MentorAI" : "You"}
              </div>
              <div className="chat-text">{msg.content}</div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar assistant">🤖</div>
            <div className="chat-bubble-content assistant">
              <div className="chat-sender">MentorAI</div>
              <div className="chat-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="chat-suggestions">
          <p className="suggestions-label">Try asking:</p>
          <div className="suggestion-chips">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                className="suggestion-chip"
                onClick={() => handleSuggestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat-input-area" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          placeholder="Ask MentorAI anything..."
          rows={1}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={sending || !input.trim()}
        >
          {sending ? "..." : "➤"}
        </button>
      </form>
    </div>
  );
}
