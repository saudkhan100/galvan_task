import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const email = localStorage.getItem("email");
    
    if (token) {
      setUser({
        email: email || "User",
      });
    }
  }, []);

  // Refresh user data when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const token = localStorage.getItem("access");
      const email = localStorage.getItem("email");
      
      if (token) {
        setUser({
          email: email || "User",
        });
      } else {
        setUser(null);
      }
    };

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };
    
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("first_name");
    localStorage.removeItem("profile_pic");
    localStorage.removeItem("role");
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="bg-maroon-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">
          <Link href="/">Galvan AI</Link>
        </h1>

        <nav className="flex items-center gap-6 relative">
          {!user ? (
            <>
              <Link
                href="/"
                className="hover:text-gray-200 font-semibold transition-colors"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="hover:text-gray-200 font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hover:text-gray-200 font-semibold transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onMouseEnter={() => setDropdownOpen(true)}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="flex items-center gap-2 focus:outline-none px-3 py-2 rounded hover:bg-maroon-700 transition-colors"
              >
                <span className="font-semibold">{user.email}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-40 bg-white text-gray-800 rounded shadow-lg z-50 border border-gray-200"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                  Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}