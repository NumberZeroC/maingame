import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

function Header() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页" },
    { path: "/games", label: "游戏" },
    { path: "/leaderboard", label: "排行" },
  ];

  return (
    <header className="sticky top-0 bg-white border-b border-gray-300 z-50">
      <div className="max-w-7xl mx-auto px-md py-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            AI游戏平台
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "nav-link",
                location.pathname === item.path && "nav-link-active",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-sm">
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <Link to="/profile">
            <button className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
