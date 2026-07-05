import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}") || {};
  const profilePath = userData.role === "admin" ? "/admin/profile" : userData.role === "mentor" ? "/mentor/profile" : null;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Admin Config</h1>
          <p className="text-sm text-brand-text-secondary">
            This area is your admin control center. Use it to review platform settings, manage user defaults, and keep your profile details current.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-bold text-white mb-4">Purpose of Config</h2>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            The config page is designed to help administrators manage platform-level preferences, access controls, analytics filters, and profile settings. It is the first place to check when you want to update your account or inspect general admin tools.
          </p>
          <p className="text-sm text-brand-text-secondary leading-relaxed mt-4">
            Right now, core platform actions remain on the dashboard and management pages. Use the profile link to update your admin contact info securely.
          </p>
          {profilePath && (
            <button
              onClick={() => navigate(profilePath)}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand-crystal px-5 py-3 text-sm font-bold text-black hover:bg-brand-crystal/90 transition-colors"
            >
              Open Profile Settings
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-bold text-white mb-4">Admin Notes</h2>
          <ul className="space-y-3 text-sm text-brand-text-secondary list-disc list-inside">
            <li>Profile updates are stored securely and reflected in future admin sessions.</li>
            <li>Mentor and student access controls are managed from their respective management pages.</li>
            <li>Analytics configuration remains available in the Intelligence dashboard.</li>
            <li>More platform settings will appear here as the admin control center expands.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
