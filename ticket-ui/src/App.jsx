import { useLocation, Outlet, Link } from "react-router-dom";
import Logo from "./assets/logo-black.png";

import Header from "./components/Header.jsx";

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isHomePage = location.pathname === "/";

  const getBackgroundColor = () => {
    if (isLoginPage) return "";
    if (isHomePage) return "min-h-screen bg-blue-700";
    return "min-h-screen bg-gray-900 shadow-lg";
  };

  const showSimpleNav = isHomePage || isLoginPage;

  return (
    <div className={getBackgroundColor()}>
      {showSimpleNav ? (
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-2">
            <div className="flex justify-between h-14 items-center">
              <img src={Logo} alt="Logo" className="h-40 w-auto" />
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                >
                  Inicio
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <Header />
      )}

      <main
        className={isLoginPage ? "" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"}
      >
        <Outlet />
      </main>
    </div>
  );
}
