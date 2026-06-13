import Sidebar from "../components/Sidebar";

const MainLayout = ({
  children,
  activePage,
  setActivePage,
  darkMode,
  setDarkMode,
  onLogout,
}) => {
  return (
    <div
      style={{
        background: darkMode ? "#0f172a" : "#f1f5f9",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={onLogout}
      />

    <main
 style={{
  flex: 1,
  marginLeft: 220,
  padding: "32px 40px",
  minHeight: "100vh",
  width: "calc(100vw - 220px)",
  overflowX: "hidden",
  boxSizing: "border-box",
}}
>
  <div
  style={{
    width: "100%",
    maxWidth: 1440,
    margin: "0 auto",
  }}
>
  {children}
</div>
</main>
    </div>
  );
};

export default MainLayout;