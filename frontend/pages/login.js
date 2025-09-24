import { useState } from "react";
import { api, setAuthToken } from "../lib/api";
import { useRouter } from "next/router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { access, refresh, role, email } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role); 
      localStorage.setItem("email", email); 


      setAuthToken(access);

      if (role === "superadmin") {
        router.push("/admin/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } 
      else {
        router.push("/profile"); // redirect regular users to profile page
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-white px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl items-center gap-10">
        
        {/* Left Side - Info / Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-maroon-600 mb-6">
            Welcome Back to <span className="text-gray-800">Galvan AI</span>
          </h1>
          <p className="text-gray-700 text-lg">
            Secure authentication with role-based access, modern UI, and a seamless user experience.
          </p>
        </div>

        {/* Right Side - Login Card */}
        <div className="md:w-1/2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full text-center transform transition hover:scale-[1.02]">
          <h2 className="text-3xl font-bold text-maroon-600 mb-6">Login</h2>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />

            <button
              type="submit"
              className="mt-2 px-6 py-3 bg-maroon-600 text-white font-semibold rounded-xl shadow-md hover:bg-maroon-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Logging in..." : "🔑 Login"}
            </button>
          </form>

          <p className="mt-6 text-gray-600 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-maroon-600 font-semibold hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
