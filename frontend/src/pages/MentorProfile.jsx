import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Edit2, Save, X, User, Mail, Phone, BookOpen } from "lucide-react";

const MentorProfile = () => {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await API.get("/mentor/profile");
        const data = res.data.mentor || res.data;
        setMentor(data);
        setFormData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put("/mentor/profile", {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        subject: formData.subject,
        bio: formData.bio,
        department: formData.department,
      });
      const updatedMentor = res.data.mentor;
      setMentor(updatedMentor);
      setFormData(updatedMentor);
      setIsEditing(false);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: updatedMentor.name, email: updatedMentor.email }));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background text-white flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!mentor || !mentor.name) {
    return (
      <div className="min-h-screen bg-brand-background text-white flex justify-center items-center">
        <p>Failed to load profile. Please check your connection or login again.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Mentor <span className="text-brand-crystal">Profile</span>
        </h1>
        <p className="text-sm text-brand-text-secondary font-medium">Manage your profile information</p>
      </header>

      <div className="rounded-[2.5rem] border border-white/5 bg-brand-card p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-crystal text-black font-bold rounded-xl hover:bg-brand-crystal/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{mentor.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <Mail className="w-4 h-4 inline mr-2" />
              Email ID
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{mentor.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <Phone className="w-4 h-4 inline mr-2" />
              Mobile Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{mentor.mobile || "Not provided"}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department || ""}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{mentor.department || "General"}</p>
            )}
          </div>

          {/* Subject Handler */}
          <div>
            <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Subject / Specialization
            </label>
            {isEditing ? (
              <input
                type="text"
                name="subject"
                value={formData.subject || ""}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Mathematics"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal"
              />
            ) : (
              <p className="text-lg text-white">{mentor.subject || "Not specified"}</p>
            )}
          </div>
        </div>

        {/* Bio / Suggestions */}
        <div className="mt-6">
          <label className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest mb-2 block">
            Bio / Professional Summary
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              placeholder="Share your experience, qualifications, and teaching approach..."
              rows="4"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-crystal resize-none"
            />
          ) : (
            <p className="text-white whitespace-pre-wrap">{mentor.bio || "No bio provided"}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 font-bold rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setFormData(mentor);
                setIsEditing(false);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-brand-text-secondary uppercase tracking-widest">Mentor ID</p>
            <p className="text-lg font-mono text-brand-crystal mt-1">{mentor._id?.slice(-8) || "N/A"}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-brand-text-secondary uppercase tracking-widest">Member Since</p>
            <p className="text-lg text-white mt-1">{new Date(mentor.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorProfile;