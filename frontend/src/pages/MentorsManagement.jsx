import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

export default function MentorsManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/mentors");
      if (res.data.success) {
        setMentors(res.data.mentors);
      }
    } catch {
      showToast("Failed to fetch mentors", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (!editingId && !formData.password)) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      if (editingId) {
        const res = await API.put(`/admin/mentors/${editingId}`, {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile
        });
        if (res.data.success) {
          showToast("Mentor updated successfully");
          fetchMentors();
        }
      } else {
        const res = await API.post("/admin/mentors", formData);
        if (res.data.success || res.status === 201) {
          showToast("Mentor created successfully");
          fetchMentors();
        }
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleEdit = (mentor) => {
    setFormData({
      name: mentor.name,
      email: mentor.email,
      password: "",
      mobile: mentor.mobile || ""
    });
    setEditingId(mentor._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mentor?")) return;
    
    try {
      const res = await API.delete(`/admin/mentors/${id}`);
      if (res.data.success) {
        showToast("Mentor deleted successfully");
        fetchMentors();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete mentor", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      mobile: ""
    });
    setEditingId(null);
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  if (loading) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-semibold text-brand-text">Mentor Management</h1>
        <div className="h-96 bg-brand-card rounded-xl animate-pulse border border-white/10" />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text">Mentor Management</h1>
          <p className="text-sm text-brand-text-secondary">Manage mentors in your learning system</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-2 bg-brand-crystal text-black font-semibold rounded-lg hover:bg-brand-crystal/90 transition w-full md:w-auto"
        >
          + Create Mentor
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
        />
      </div>

      {/* Mentors Table */}
      <div className="rounded-2xl border border-white/10 bg-brand-card shadow-glow overflow-hidden">
        {filteredMentors.length === 0 ? (
          <div className="p-12 text-center text-brand-text-secondary">
            <p className="text-lg">No mentors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-black/20">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.map(mentor => (
                  <tr key={mentor._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-brand-text">{mentor.name}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{mentor.email}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(mentor)}
                        className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mentor._id)}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={editingId ? "Edit Mentor" : "Create Mentor"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-brand-text-secondary mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Mentor name"
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-brand-text-secondary mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="mentor@example.com"
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
              required
            />
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm text-brand-text-secondary mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-brand-text-secondary mb-2">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
            />
          </div>
        </div>
      </Modal>
    </section>
  );
}
