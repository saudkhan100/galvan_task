import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import UserModal from "./userModal";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role") || "");
    }
  }, []);

  const fetchUsers = async () => {
    if (!role) return;

    const token = localStorage.getItem("access");
    if (!token) return alert("Login first");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      const filtered =
        role === "admin" ? res.data.filter((u) => u.role === "user") : res.data;
      setUsers(filtered);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) fetchUsers();
  }, [role]);

  const openModal = (user = null) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete user?")) return;
    const token = localStorage.getItem("access");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        {role === "superadmin" && (
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + Create User
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Profile</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mobile Number</th> {/* New column */}
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">
                    {u.profile_pic ? (
                      <img
                        src={`http://localhost:5000${u.profile_pic}`}
                        alt="profile"
                        className="w-10 h-10 rounded-full mx-auto object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full mx-auto"></div>
                    )}
                  </td>
                  <td className="p-2 border">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.mobile_number || "-"}</td> {/* Display mobile number */}
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    {role === "superadmin" && (
                      <>
                        <button
                          onClick={() => openModal(u)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <UserModal
          currentUser={currentUser}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
