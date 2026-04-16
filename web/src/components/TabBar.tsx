import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

function TabBar() {
  const location = useLocation();

  const tabs = [
    { path: "/", icon: HomeIcon, label: "首页" },
    { path: "/games", icon: GameIcon, label: "游戏" },
    { path: "/leaderboard", icon: TrophyIcon, label: "排行" },
    { path: "/profile", icon: UserIcon, label: "我的" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 hidden md:hidden flex justify-around py-sm z-50">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={clsx(
            "flex flex-col items-center gap-xs text-xs",
            location.pathname === tab.path ? "text-primary" : "text-gray-500",
          )}
        >
          <tab.icon className="w-6 h-6" />
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z" />
    </svg>
  );
}

function GameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M18 9v6M15 12h6" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 21V11M16 21V7M12 21V3" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1" />
    </svg>
  );
}

export default TabBar;
