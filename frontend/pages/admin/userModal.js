import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function UserModal({ currentUser, onClose, onSuccess }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
    profile_pic: null,
    mobile_number: "", // New field
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        password: "",
        role: currentUser.role || "user",
        profile_pic: currentUser.profile_pic || null,
        mobile_number: currentUser.mobile_number || "", // Pre-fill if editing
      });
    }
  }, [currentUser]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, profile_pic: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("email", form.email);
    if (!currentUser) formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("mobile_number", form.mobile_number); // Append mobile number

    if (form.profile_pic instanceof File) {
      formData.append("profile_pic", form.profile_pic);
    }

    if (!currentUser) formData.append("is_admin_creation", true);

    try {
      if (currentUser) {
        await api.put(`/admin/users/${currentUser.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("User updated");
      } else {
        await api.post(`/auth/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("User created successfully (OTP skipped for admin)");
      }
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <h3 className="text-xl font-bold mb-4">
          {currentUser ? "Edit User" : "Create User"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
            className="px-3 py-2 border rounded"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
            className="px-3 py-2 border rounded"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="px-3 py-2 border rounded"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            className="px-3 py-2 border rounded"
          />

          {!currentUser && (
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="px-3 py-2 border rounded"
            />
          )}

          {/* Profile Picture */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Profile Picture</label>
            {form.profile_pic && (
              <img
                src={
                  form.profile_pic instanceof File
                    ? URL.createObjectURL(form.profile_pic)
                    : form.profile_pic.startsWith("/")
                    ? `http://localhost:5000${form.profile_pic}`
                    : form.profile_pic
                }
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover mb-2"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {currentUser ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
