import { FONT_FAMILY } from "../../theme/fonts";
import { SPACING }     from "../../theme/spacing";

const ScreenWrapper = ({ children }) => (
  <div style={{
    background:  "#ffffff",
    minHeight:   "100%",
    padding:     SPACING[6],
    fontFamily:  FONT_FAMILY.base,
    boxSizing:   "border-box",
  }}>
    {children}
  </div>
);

export default ScreenWrapper;
