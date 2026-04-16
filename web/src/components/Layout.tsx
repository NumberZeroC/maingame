import { Outlet } from "react-router-dom";
import Header from "./Header";
import TabBar from "./TabBar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}

export default Layout;
