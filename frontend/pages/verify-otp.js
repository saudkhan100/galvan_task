import { useState } from "react";
import { api } from "../lib/api";
import { useRouter } from "next/router";

export default function VerifyOTP() {
  const router = useRouter();
  const { email } = router.query;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      const { access, refresh } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Navigate to login page with a query param to show a success message
      router.push(`/login?registered=true`);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-white via-gray-100 to-white px-4">
      {/* Left text section */}
      <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-maroon-600 mb-6">
          Verify Your Account
        </h1>
        <p className="text-gray-700 text-lg md:text-xl">
          Enter the OTP sent to your email to complete registration. After
          verification, you can login to your account and start using Galvan AI.
        </p>
      </div>

      {/* Right card */}
      <div className="md:w-1/2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-maroon-600 mb-4">Verify OTP</h2>
        {email && <p className="text-gray-600 mb-4">OTP sent to: <strong>{email}</strong></p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
