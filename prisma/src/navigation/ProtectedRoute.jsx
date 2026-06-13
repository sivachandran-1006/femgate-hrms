const ProtectedRoute = ({ isLoggedIn, children, fallback = null }) => {
  if (!isLoggedIn) return fallback;
  return children;
};

export default ProtectedRoute;
