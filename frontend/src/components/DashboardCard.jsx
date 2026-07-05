export default function DashboardCard({ title, value, icon, trend = "+0.0%", color = "brand-crystal" }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card p-7 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-brand-crystal/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${color}/5 blur-[60px] transition-all group-hover:bg-${color}/10`} />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-${color}/10 text-${color} border border-${color}/20 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black tracking-widest text-green-400 uppercase italic">{trend}</span>
            <div className="h-1 w-8 rounded-full bg-green-400/20 mt-1 overflow-hidden">
               <div className="h-full bg-green-400 animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary opacity-70 italic">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black italic text-white tracking-tighter">
              {value}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className={`absolute bottom-0 right-0 h-16 w-16 translate-x-8 translate-y-8 rotate-45 bg-${color}/5 border-t border-l border-${color}/20`} />
    </div>
  );
}

