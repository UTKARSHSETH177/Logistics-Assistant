import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const bgImage =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"; // Example courier/warehouse background

function App() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to Smart Logistics Assistant! 🚚\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setInput("");
    try {
      const res = await axios.post("http://localhost:8000/ask", {
        message: input,
      });
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: res.data.answer || "No response." },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Network error. Please try again." },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.7)), url(${bgImage}) center/cover no-repeat`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          width: 420,
          maxWidth: "95vw",
          padding: 32,
          marginTop: 32,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 24,
            color: "#1a237e",
            letterSpacing: 1,
          }}
        >
          <span role="img" aria-label="truck">
            🚚
          </span>{" "}
          Smart Logistics Assistant
        </h2>
        <div
          ref={chatRef}
          style={{
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 16,
            height: 320,
            overflowY: "auto",
            marginBottom: 16,
            border: "1px solid #e0e0e0",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.from === "user" ? "right" : "left",
                margin: "8px 0",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background:
                    msg.from === "user"
                      ? "linear-gradient(90deg,#1976d2,#64b5f6)"
                      : "#fff",
                  color: msg.from === "user" ? "#fff" : "#333",
                  borderRadius: 16,
                  padding: "10px 18px",
                  maxWidth: "80%",
                  fontWeight: msg.from === "user" ? 500 : 400,
                  boxShadow:
                    msg.from === "user"
                      ? "0 2px 8px rgba(25,118,210,0.08)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <b>
                  {msg.from === "user" ? "You" : "Assistant"}
                  {msg.from === "bot" && (
                    <span role="img" aria-label="bot">
                      {" "}
                      🤖
                    </span>
                  )}
                  :
                </b>{" "}
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
              outline: "none",
            }}
            placeholder="Type your logistics question..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{
              background:
                "linear-gradient(90deg,#1976d2 60%,#64b5f6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
            }}
          >
            Send
          </button>
        </div>
      </div>
      <div style={{ color: "#fff", marginTop: 32, opacity: 0.7 }}>
        <span role="img" aria-label="copyright">
          ©️
        </span>{" "}
        Your Courier Company, {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default App;
