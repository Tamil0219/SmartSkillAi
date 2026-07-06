import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Edit2, Save, X, User, Mail, Phone, ShieldCheck } from "lucide-react";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/admin/profile');
        const data = res.data.admin || res.data;
        setProfile(data);
        setFormData(data);
      } catch (error) {
        const message = error?.response?.data?.message || 'Unable to load admin profile. Please try again.';
        console.error('Error fetching admin profile:', message, error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/admin/profile', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        department: formData.department,
        bio: formData.bio,
      });
      const updatedAdmin = res.data.admin;
      setProfile(updatedAdmin);
      setFormData(updatedAdmin);
      setIsEditing(false);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: updatedAdmin.name, email: updatedAdmin.email }));

      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background text-white flex justify-center items-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-brand-background text-white flex justify-center items-center">
        <div className="rounded-3xl border border-white/10 bg-brand-card p-8 text-center max-w-lg">
          <p className="text-lg font-semibold text-white mb-3">Unable to load admin profile.</p>
          <p className="text-sm text-brand-text-secondary mb-6">{error || 'Please try again or sign in again if your session expired.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-brand-crystal px-6 py-3 text-sm font-bold text-black hover:bg-brand-crystal/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Admin <span className="text-brand-crystal">Profile</span>
        </h1>
        <p className="text-sm text-brand-text-secondary font-medium">Update your administrative profile and contact details.</p>
      </header>

      <div className="rounded-[2.5rem] border border-white/5 bg-brand-card p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <p className="text-sm text-brand-text-secondary">This profile controls your admin identity in the dashboard.</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-crystal text-black font-bold rounded-xl hover:bg-brand-crystal/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <Phone className="w-4 h-4 inline mr-2" />
              Contact Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{profile.mobile || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <ShieldCheck className="w-4 h-4 inline mr-2" />
              Department / Unit
            </label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{profile.department || 'Administration'}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
            Administration Summary
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              placeholder="Describe your role, responsibilities, or admin focus..."
              rows="4"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal resize-none"
            />
          ) : (
            <p className="text-white whitespace-pre-wrap">{profile.bio || 'No summary added yet.'}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex flex-col gap-4 mt-8 md:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 font-bold rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFormData(profile);
                setIsEditing(false);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary">Admin ID</p>
            <p className="text-lg font-mono text-brand-crystal mt-2">{profile._id?.slice(-8) || 'N/A'}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary">Profile Created</p>
            <p className="text-lg text-white mt-2">{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
