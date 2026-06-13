import { FONT_FAMILY } from "../../theme/fonts";
import { SPACING }     from "../../theme/spacing";
import { COLORS }      from "../../theme/colors";

const ScreenWrapper = ({ children, darkMode }) => (
  <div style={{
    background:  darkMode ? COLORS.dark.pageBg : COLORS.light.pageBg,
    minHeight:   "calc(100vh - 60px)",
    padding:     SPACING[6],
    fontFamily:  FONT_FAMILY.base,
    boxSizing:   "border-box",
  }}>
    {children}
  </div>
);

export default ScreenWrapper;
