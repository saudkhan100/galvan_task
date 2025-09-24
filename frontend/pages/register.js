import { useState } from "react";
import { api } from "../lib/api";
import { useRouter } from "next/router";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setProfilePic(file);
    setError("");
  };

  const validateForm = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (!phone) {
      setError("Please enter your mobile number.");
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    const payload = new FormData();
    payload.append("first_name", form.first_name);
    payload.append("last_name", form.last_name);
    payload.append("email", form.email);
    payload.append("password", form.password);
    payload.append("mobile_number", phone);
    if (profilePic) payload.append("profile_pic", profilePic);

    setLoading(true);
    try {
      await api.post("/auth/register", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-white via-gray-100 to-white px-4">
      {/* Left text section */}
      <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-maroon-600 mb-6">
          Welcome to Galvan AI
        </h1>
        <p className="text-gray-700 text-lg md:text-xl">
          Build secure authentication with role-based access, modern UI, and a
          seamless user experience. Join us and create your account quickly.
        </p>
      </div>

      {/* Right register card */}
      <div className="md:w-1/2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-maroon-600 mb-6">Register</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          <input
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />

          {/* Password with show/hide */}
          <div className="relative">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="px-4 py-3 rounded-xl border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-maroon-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Phone input */}
          <PhoneInput
            placeholder="Mobile Number"
            value={phone}
            onChange={setPhone}
            defaultCountry="PK"
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />

          {/* Profile pic */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
          {profilePic && typeof profilePic !== "string" && (
            <img
              src={URL.createObjectURL(profilePic)}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-full mx-auto"
            />
          )}

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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
