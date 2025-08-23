import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useEffect } from "react";
import ButtonMotion from "../components/ButtonMotion";

export default function Header() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check if current user is admin
  const isCurrentUserAdmin = currentUser?.uid === "2VUmFYgHvgTzwyqfm5YLVAYLsWZ2";

  useEffect(() => {
    if (!authLoading && !currentUser){
        navigate('/login', {replace: true});
    }
  }, [authLoading, currentUser, navigate]);

  const navItems = [
    { label: "Home", to: "/", authRequired: false },
    { label: "All Flats", to: "/flats", authRequired: false },
    { label: "My Flats", to: "/my-flats", authRequired: true },
    { label: "Favorites", to: "/favorites", authRequired: true  },
    { label: "Add New Flat", to: "/new-flat", authRequired: true  },
    // Admin-only navigation item
    ...(isCurrentUserAdmin ? [{ label: "All Users", to: "/all-users", authRequired: true, adminOnly: true }] : [])
  ];

  const handleNavClick = (to: string, authRequired: boolean) => {
    if (authRequired && !currentUser) {
      navigate("/login", { replace: true });
    } else {
      navigate(to);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo à gauche */}
        <Link to="/" className="flex items-center">
          <img src="/FlatSpark-logo.png"alt="Logo" className="h-10 w-auto mr-2" />
        </Link>

         {/* Greeting utilisateur */}
          <div className="ml-4 text-gray-700">
            {currentUser ? (
              <span>
                Welcome, {currentUser.displayName || currentUser.email}
                {isCurrentUserAdmin && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Admin
                  </span>
                )}
              </span>
            ) : (
              <span>Not connected</span>
            )}
          </div>

        {/* Navigation */}
        <nav className="flex space-x-4">
          {navItems.map(({ label, to, authRequired }) => (
            <ButtonMotion
              key={to}
              onClick={() => handleNavClick(to, authRequired)}
              className={`px-3 py-2 rounded-md font-medium transition-colors ${
                label === "All Users" 
                  ? "text-green-700 hover:text-green-900 hover:bg-green-50" 
                  : "text-gray-700 hover:text-primary"
              }`}
            >
              {label}
            </ButtonMotion>
          ))}
        </nav>

        {/* Profil / Auth */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md font-medium transition-colors ${isActive ? 'text-white bg-primary' : 'text-gray-700 hover:text-primary'}`
                }
              >
                Profile
              </NavLink>
              <ButtonMotion
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-gray-700 hover:text-primary font-medium"
              >
                Logout
              </ButtonMotion>
            </>
          ) : (
            <NavLink
              to="/login"
              className="px-3 py-2 rounded-md text-gray-700 hover:text-primary font-medium"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}