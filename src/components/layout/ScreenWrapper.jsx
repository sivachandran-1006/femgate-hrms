import { useLocation } from "react-router-dom";
import { FONT_FAMILY } from "../../theme/fonts";
import { SPACING }     from "../../theme/spacing";
import { COLORS }      from "../../theme/colors";
import Breadcrumb      from "../ui/Breadcrumb";
import ErrorBoundary   from "../ui/ErrorBoundary";

const ScreenWrapper = ({ children, darkMode }) => {
  const { pathname } = useLocation();
  return (
    <div style={{
      background:  darkMode ? COLORS.dark.pageBg : COLORS.light.pageBg,
      minHeight:   "calc(100vh - 60px)",
      padding:     SPACING[6],
      fontFamily:  FONT_FAMILY.base,
      boxSizing:   "border-box",
    }}>
      <Breadcrumb dark={darkMode} />
      <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
    </div>
  );
};

export default ScreenWrapper;
