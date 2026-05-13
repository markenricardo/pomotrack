import Sidebar from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />

      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;