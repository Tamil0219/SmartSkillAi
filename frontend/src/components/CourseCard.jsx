import { PlayCircle, Clock, BookOpen, Youtube, FileText, Paperclip, Edit, Trash2, Download } from "lucide-react";

export default function CourseCard({ title, mentor, difficulty, progress = 0, onContinue, youtubeUrl, notes, attachments, isMentor, onEdit, onDelete }) {
  
  const getFilenameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'download';
      
      // Check if filename looks like a hash (no extension)
      if (!filename.includes('.')) {
        // Try to guess file type from context or just use generic name
        return '📄 Course Material';
      }
      return filename;
    } catch {
      return 'Download File';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-brand-card p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-brand-crystal/30">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-2xl bg-brand-crystal/10 flex items-center justify-center text-brand-crystal border border-brand-crystal/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            difficulty === 'Hard' ? 'border-red-500/20 text-red-400 bg-red-400/5' : 
            difficulty === 'Medium' ? 'border-amber-500/20 text-amber-400 bg-amber-400/5' : 
            'border-green-500/20 text-green-400 bg-green-400/5'
          }`}>
            {difficulty}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white group-hover:text-brand-crystal transition-colors italic leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">
               Expert: <span className="text-white ml-1">{mentor}</span>
             </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="space-y-3">
          {youtubeUrl && (
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Youtube className="w-4 h-4 text-red-500" />
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-crystal hover:underline">📺 Video Lecture</a>
            </div>
          )}
          {notes && (
            <div className="flex items-start gap-2 text-sm text-brand-text-secondary">
              <FileText className="w-4 h-4 mt-0.5" />
              <p className="line-clamp-2">{notes}</p>
            </div>
          )}
          {attachments?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                <Paperclip className="w-4 h-4" />
                <span className="font-semibold">📎 Resources ({attachments.length})</span>
              </div>
              <ul className="space-y-1 ml-6">
                {attachments.map((attachment, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <a 
                      href={attachment} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-brand-crystal hover:text-white hover:underline transition-colors"
                      download
                    >
                      <Download className="w-3 h-3" />
                      {getFilenameFromUrl(attachment)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!youtubeUrl && !notes && (!attachments || attachments.length === 0) && isMentor && (
            <div className="text-sm text-brand-text-secondary italic">
              No additional resources added yet.
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">
            <span>Progress Link</span>
            <span className="text-brand-crystal">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-brand-crystal shadow-[0_0_15px_#00e5ff]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action */}
        {isMentor ? (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl bg-blue-500/10 text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={onContinue}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white border border-white/5 hover:bg-brand-crystal hover:text-black hover:border-brand-crystal transition-all duration-300"
          >
            <PlayCircle className="w-4 h-4" />
            Synchronize Learning
          </button>
        )}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
    </div>
  );
}

