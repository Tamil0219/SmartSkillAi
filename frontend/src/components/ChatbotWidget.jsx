import { useMemo, useState, useRef, useEffect } from "react";
import API from "../services/api";
import { Loader } from "lucide-react";

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi! I'm Tom AI, your AI learning assistant. How can I help you today?" },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!draft.trim() || loading) return;

    const userText = draft.trim();
    const userMessage = { id: crypto.randomUUID(), role: "user", text: userText };
    
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const response = await API.post("/ai/chat", {
        message: userText,
        sessionId,
      });

      if (response.data.success) {
        const { response: aiText, sessionId: newSessionId } = response.data.data;
        
        // Set sessionId on first response
        if (!sessionId) {
          setSessionId(newSessionId);
        }

        const aiMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: aiText,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, I couldn't process your request. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: error.response?.data?.message || "Error connecting to AI service. Please check your API key in the backend .env file.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await API.post("/ai/clear-chat", { sessionId });
      setMessages([
        { id: 1, role: "assistant", text: "Hi! I'm your AI learning assistant. How can I help you today?" },
      ]);
      setSessionId(null);
    } catch (error) {
      console.error("Clear chat error:", error);
    }
  };

  const grouped = useMemo(() => {
    return messages.map((m) => (
      <div
        key={m.id}
        className={`rounded-2xl p-4 shadow-md max-w-xs lg:max-w-md ${
          m.role === "user"
            ? "self-end bg-brand-crystal/20 text-brand-text"
            : "self-start bg-white/10 text-brand-text"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
      </div>
    ));
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">AI Learning Assistant</h2>
          <p className="text-xs text-brand-text-secondary">Powered by Tom AI - Ask anything about courses, exams, or learning strategies.</p>
        </div>
        {sessionId && (
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
          >
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col">
        {grouped}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your question..."
          disabled={loading}
          className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-2xl bg-brand-crystal px-5 py-3 text-sm font-semibold text-black hover:bg-brand-crystal/90 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}
