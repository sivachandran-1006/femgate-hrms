import { useAuth } from "./useAuth";
import { can } from "../constants/permissions";

// Returns a function: can("leave.approve") → true/false for the logged-in user
export const usePermission = () => {
  const { userRole } = useAuth();
  return (permission) => can(userRole, permission);
};
