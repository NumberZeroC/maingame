import { Link } from "react-router-dom";

interface GameCardProps {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  rating: number;
  players: number;
  category: string[];
  badges?: ("ai" | "hot" | "new")[];
}

function GameCard({
  id,
  name,
  description,
  thumbnail,
  rating,
  players,
  category,
  badges,
}: GameCardProps) {
  return (
    <Link to={`/game/${id}`}>
      <div className="card group">
        <div className="relative h-44 overflow-hidden">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="btn btn-primary btn-md">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              立即玩
            </button>
          </div>
          {badges && badges.length > 0 && (
            <div className="absolute top-sm left-sm flex gap-xs">
              {badges.map((badge) => (
                <span key={badge} className={`badge badge-${badge}`}>
                  {badge === "ai" ? "AI" : badge === "hot" ? "HOT" : "NEW"}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="p-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-xs">{name}</h3>
          <p className="text-sm text-gray-500 mb-md line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between gap-sm">
            <div className="flex gap-md text-sm text-gray-500">
              <span className="flex items-center gap-xs">
                <svg
                  className="w-3.5 h-3.5 text-yellow-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-xs">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {formatNumber(players)}
              </span>
            </div>
            <div className="flex gap-xs">
              {category.slice(0, 2).map((cat) => (
                <span key={cat} className="tag">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(0) + "万+";
  }
  return num.toString();
}

export default GameCard;
