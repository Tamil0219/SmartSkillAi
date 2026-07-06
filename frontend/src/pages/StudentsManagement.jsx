import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

export default function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    mentorId: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, mentorsRes] = await Promise.all([
        API.get("/admin/students"),
        API.get("/admin/mentors")
      ]);
      
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students);
      }
      if (mentorsRes.data.success) {
        setMentors(mentorsRes.data.mentors);
      }
    } catch {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (!formData.name || !formData.email || (!editingId && !formData.password)) {
      setFormError("Please fill all required fields");
      return;
    }

    setFormLoading(true);

    try {
      if (editingId) {
        const res = await API.put(`/admin/students/${editingId}`, {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          department: "General",
          mentorId: formData.mentorId
        });
        if (res.data.success) {
          showToast("✅ Student updated successfully");
          fetchData();
          setIsModalOpen(false);
          resetForm();
        }
      } else {
        const res = await API.post("/admin/students", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          department: "General",
          mentorId: formData.mentorId
        });
        if (res.data.success || res.status === 201) {
          showToast("✅ Student created successfully");
          fetchData();
          setIsModalOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Operation failed";
      setFormError("❌ " + errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      password: "",
      mobile: student.mobile || "",
      mentorId: student.mentorId || ""
    });
    setEditingId(student._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    
    try {
      const res = await API.delete(`/admin/students/${id}`);
      if (res.data.success) {
        showToast("Student deleted successfully");
        fetchData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete student", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      mobile: "",
      mentorId: ""
    });
    setFormError("");
    setEditingId(null);
  };

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  if (loading) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-semibold text-brand-text">Student Management</h1>
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
          <h1 className="text-3xl font-semibold text-brand-text">Student Management</h1>
          <p className="text-sm text-brand-text-secondary">Manage students in your learning system</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-2 bg-brand-crystal text-black font-semibold rounded-lg hover:bg-brand-crystal/90 transition w-full md:w-auto"
        >
          + Create Student
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

      {/* Students Table */}
      <div className="rounded-2xl border border-white/10 bg-brand-card shadow-glow overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <div className="p-12 text-center text-brand-text-secondary">
            <p className="text-lg">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-black/20">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Assigned Mentor</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map(student => {
                  const mentorFromStudent = student.mentorId && typeof student.mentorId === 'object' ? student.mentorId : null;
                  const assignedMentor = mentorFromStudent || mentors.find(m => m._id?.toString() === student.mentorId?.toString());
                  return (
                    <tr key={student._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-brand-text">{student.name}</td>
                      <td className="px-6 py-4 text-brand-text-secondary">{student.email}</td>
                      <td className="px-6 py-4 text-brand-text-secondary">
                        {assignedMentor ? (
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                            {assignedMentor.name}
                          </span>
                        ) : (
                          <span className="text-xs text-brand-text-secondary italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student._id)}
                          className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-white/10 text-brand-text disabled:opacity-50 hover:bg-white/5 transition"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg border transition ${
                  currentPage === page
                    ? "bg-brand-crystal text-black border-brand-crystal"
                    : "border-white/10 text-brand-text hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-white/10 text-brand-text disabled:opacity-50 hover:bg-white/5 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        title={editingId ? "Edit Student" : "Create Student"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        error={formError}
        loading={formLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-brand-text-secondary mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Student name"
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
              placeholder="student@example.com"
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
                placeholder="At least 6 characters"
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
              placeholder="Phone number (optional)"
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-crystal"
            />
          </div>
          <div>
            <label className="block text-sm text-brand-text-secondary mb-2">Assign Mentor (Optional)</label>
            <select
              name="mentorId"
              value={formData.mentorId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-crystal"
            >
              <option value="">-- Select Mentor --</option>
              {mentors.map(mentor => (
                <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </section>
  );
}
