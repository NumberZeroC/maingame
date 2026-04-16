function GamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-lg">游戏加载中...</h1>
        <p className="text-gray-400">游戏运行容器将在此处渲染</p>
        <div className="mt-xl animate-pulse">
          <svg
            className="w-16 h-16 mx-auto text-primary"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
