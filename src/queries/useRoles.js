import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles, getRole, getRoleMeta, getRoleUsers, getRoleAudit,
  createRole, cloneRole, updateRole, deleteRole,
} from "../api/roleApi";

const KEY = ["roles"];

export const useRoles     = (params) => useQuery({ queryKey: [...KEY, params], queryFn: () => getRoles(params) });
export const useRole      = (id)     => useQuery({ queryKey: [...KEY, "one", id], queryFn: () => getRole(id), enabled: !!id });
export const useRoleMeta  = ()       => useQuery({ queryKey: ["role-meta"], queryFn: getRoleMeta });
export const useRoleUsers = (id)     => useQuery({ queryKey: [...KEY, id, "users"], queryFn: () => getRoleUsers(id), enabled: !!id });
export const useRoleAudit = (id)     => useQuery({ queryKey: [...KEY, id, "audit"], queryFn: () => getRoleAudit(id), enabled: !!id });

const inv = (qc) => qc.invalidateQueries({ queryKey: KEY });

export const useCreateRole = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createRole, onSuccess: () => inv(qc) }); };
export const useCloneRole  = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => cloneRole(id, d), onSuccess: () => inv(qc) }); };
export const useUpdateRole = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...d }) => updateRole(id, d), onSuccess: () => inv(qc) }); };
export const useDeleteRole = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id) => deleteRole(id), onSuccess: () => inv(qc) }); };
