import { useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import { useRouter } from "next/router";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return router.push("/login");
    setAuthToken(token);

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        alert(err.response?.data?.message || err.message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your profile...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-lg text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header with Image */}
          <div className="bg-gradient-to-r from-maroon-600 to-maroon-700 p-8 text-center">
            <div className="relative inline-block">
              <img
                src={user.profile_pic || "/default-profile.png"}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                onError={(e) => {
                  e.target.src = "/default-profile.png";
                }}
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mt-4">
              {user.first_name} {user.last_name}
            </h2>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mt-2">
              <span className="text-white font-medium capitalize">{user.role}</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center">
                      <span className="text-maroon-600 font-bold">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center">
                      <span className="text-maroon-600 font-bold">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maroon-100 rounded-lg flex items-center justify-center">
                      <span className="text-maroon-600 font-bold">📱</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="font-medium text-gray-900">
                        {user.mobile_number || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Account Role</p>
                    <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-600">Account Status</p>
                    <p className="font-medium text-green-700">Active ✓</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              
              
              <button
                onClick={() => {
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  router.push("/login");
                }}
                className="flex-1 px-6 py-3 bg-maroon-600 text-white rounded-xl font-medium hover:bg-maroon-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact support if you have any questions about your account.
          </p>
        </div>
      </div>
    </div>
  );
}