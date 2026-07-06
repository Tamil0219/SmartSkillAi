import { useState } from "react";

export default function Modal({ title, isOpen, onClose, onSubmit, children, error, loading }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSubmit) onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-brand-card border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-glow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-brand-text">{title}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-brand-text-secondary hover:text-brand-text text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {children}
          
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-brand-text hover:bg-white/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof onSubmit === 'function') {
                  onSubmit(e);
                }
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-brand-crystal text-black font-semibold hover:bg-brand-crystal/90 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
