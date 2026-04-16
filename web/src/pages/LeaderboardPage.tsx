function LeaderboardPage() {
  const rankings = [
    { rank: 1, name: "冠军玩家", score: 9999, avatar: "champion" },
    { rank: 2, name: "亚军玩家", score: 8888, avatar: "runner" },
    { rank: 3, name: "季军玩家", score: 7777, avatar: "third" },
    ...Array.from({ length: 10 }, (_, i) => ({
      rank: i + 4,
      name: `玩家${i + 4}`,
      score: 7000 - i * 500,
      avatar: `user${i + 4}`,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-lg flex items-center gap-sm">
          <span>🏆</span>
          排行榜
        </h1>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-lg bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex justify-around">
              {rankings.slice(0, 3).map((player) => (
                <div key={player.rank} className="text-center">
                  <div className="text-2xl mb-xs">
                    {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}
                  </div>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`}
                    alt={player.name}
                    className="w-12 h-12 rounded-full mx-auto mb-xs border-2 border-white"
                  />
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm opacity-80">{player.score} 分</div>
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {rankings.slice(3).map((player) => (
              <div
                key={player.rank}
                className="flex items-center gap-md p-md hover:bg-gray-50"
              >
                <div className="w-8 text-center font-semibold text-gray-500">
                  {player.rank}
                </div>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`}
                  alt={player.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{player.name}</div>
                </div>
                <div className="text-lg font-semibold text-primary">
                  {player.score}
                </div>
              </div>
            ))}
          </div>

          <div className="p-md bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-md">
              <div className="w-8 text-center font-semibold text-gray-500">
                15
              </div>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="我的排名"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">我的排名</div>
              </div>
              <div className="text-lg font-semibold text-primary">2500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
