import { useState, useEffect } from "react";
import { mockTenants } from "@/services/mockData";
import type { Tenant, TenantFormData, TenantStatus } from "@/types/tenant";
import { toast } from "sonner";
import {
  useCreateTenatPlanMutation,
  useGetTenatListQuery,
} from "@/redux/api/tenatsApi";

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const { data, isLoading } = useGetTenatListQuery({});

  const stats = data?.stats || {};

  const [createTenatPlan] = useCreateTenatPlanMutation();
  console.log(data);

  useEffect(() => {
    setTenants(data?.data);
  }, [data?.data]);

  const createTenant = async (data: TenantFormData) => {
    console.log(data);
    const payload = {
      name: data?.companyName,
      email: data?.contactEmail,
      contact_name: data?.contactName,
      plan: "Professional",
      deployment_type: data?.deploymentType,
      max_users: data?.totalUsers,
      mrr: data?.mrr,
      active_user: data?.activeUsers,
    };
    await createTenatPlan(payload).unwrap();
    toast.success("Tenant created successfully");
  };

  const updateTenant = async (id: string, data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((tenant) => (tenant.id === id ? { ...tenant, ...data } : tenant))
    );
    toast.success("Tenant updated successfully");
  };

  const changeTenantStatus = async (id: string, status: TenantStatus) => {
    await updateTenant(id, { status });
    toast.success(
      `Tenant ${
        status === "active"
          ? "activated"
          : status === "suspended"
          ? "suspended"
          : "updated"
      }`
    );
  };

  const deleteTenant = async (id: string) => {
    setTenants((prev) => prev.filter((tenant) => tenant.id !== id));
    toast.success("Tenant deleted successfully");
  };

  const getTenantById = (id: string) => {
    return tenants.find((tenant) => tenant.id === id);
  };

  return {
    tenants,
    stats,
    isLoading,
    createTenant,
    updateTenant,
    changeTenantStatus,
    deleteTenant,
    getTenantById,
  };
}
