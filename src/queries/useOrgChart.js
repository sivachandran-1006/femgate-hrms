import { useQuery } from "@tanstack/react-query";
import { getOrgTree, getOrgAnalytics, getOrgVacant } from "../api/orgApi";

export const useOrgTree      = () => useQuery({ queryKey: ["orgchart", "tree"], queryFn: getOrgTree });
export const useOrgAnalytics = () => useQuery({ queryKey: ["orgchart", "analytics"], queryFn: getOrgAnalytics });
export const useOrgVacant    = () => useQuery({ queryKey: ["orgchart", "vacant"], queryFn: getOrgVacant });
