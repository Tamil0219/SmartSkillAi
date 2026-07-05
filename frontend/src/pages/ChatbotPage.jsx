import ChatbotWidget from "../components/ChatbotWidget";

export default function ChatbotPage() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">AI Chatbot</h1>
          <p className="text-sm text-brand-text-secondary">
            Get instant assistance for your courses, exam prep, and learning plan.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-3 rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <ChatbotWidget />
        </div>
      </div>
    </section>
  );
}
