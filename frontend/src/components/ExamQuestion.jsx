export default function ExamQuestion({ question, options, onSelect, selected, onNext, timeLeft }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-crystal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-crystal">
          Current Question
        </div>
        <h2 className="text-2xl font-bold leading-relaxed text-brand-text">
          {question}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        {options && options.length > 0 ? (
          options.map((opt, index) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect?.(opt)}
              className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 ${
                selected === opt
                  ? "border-brand-crystal bg-brand-crystal/10 shadow-[0_0_20px_rgba(0,255,170,0.1)]"
                  : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  selected === opt ? "bg-brand-crystal text-black" : "bg-black/40 text-brand-text-secondary group-hover:text-brand-text"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={`text-lg font-medium transition-colors ${
                  selected === opt ? "text-brand-crystal" : "text-brand-text-secondary group-hover:text-brand-text"
                }`}>
                  {opt}
                </span>
              </div>
              {selected === opt && (
                <div className="h-2 w-2 rounded-full bg-brand-crystal shadow-[0_0_10px_#00ffaa]" />
              )}
            </button>
          ))
        ) : (
          <textarea
             className="w-full h-32 rounded-2xl border-2 border-white/5 hover:border-white/20 focus:border-brand-crystal bg-black/30 p-4 text-white text-lg resize-none transition-all focus:outline-none focus:ring-1 focus:ring-brand-crystal"
             placeholder="Type your conceptual answer here..."
             value={selected}
             onChange={(e) => onSelect?.(e.target.value)}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <p className="text-sm text-brand-text-secondary italic">
          Tip: Read the question carefully before selecting.
        </p>
        <button
          type="button"
          disabled={!selected}
          onClick={onNext}
          className={`group flex items-center gap-2 rounded-2xl px-8 py-4 font-bold shadow-lg transition-all active:scale-95 ${
            selected
              ? "bg-brand-crystal text-black hover:bg-brand-crystal/90 shadow-brand-crystal/20"
              : "bg-white/5 text-brand-text-secondary cursor-not-allowed opacity-50"
          }`}
        >
          {onNext.name === 'submitExam' ? 'Submit' : 'Save & Next'}
        </button>
      </div>
    </div>
  );
}

