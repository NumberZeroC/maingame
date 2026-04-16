import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-md">
      <div className="text-center">
        <div className="text-8xl mb-lg">🎮</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-md">404</h1>
        <p className="text-lg text-gray-500 mb-lg">
          页面找不到啦，快去玩游戏吧！
        </p>
        <Link to="/">
          <button className="btn btn-primary btn-lg">返回首页</button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
