import { useState, useEffect } from "react";
import type { Plan, PlanFormData } from "@/types/plan";
import { toast } from "sonner";
import {
  useCreatesubscriptionPlanMutation,
  useGetPlansStatsQuery,
  useGetsubscriptionQuery,
} from "@/redux/api/subscriptionApi";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  const { data, isFetching } = useGetsubscriptionQuery({});
  const { data: planStats } = useGetPlansStatsQuery({});
  const [createsubscriptionPlan] = useCreatesubscriptionPlanMutation();

  useEffect(() => {
    setPlans(data?.data);
  }, [data?.data]);

  const createPlan = async (data: PlanFormData) => {
    console.log(planStats);

    const payload = {
      plan_name: data.name,
      description: data.description,
      monthly_price: data.monthlyPrice,
      yearly_price: data.yearlyPrice,
      max_users: data.maxUsers,
      max_customers: data.maxCustomers,
      max_visits: data.maxVisits,
      features: data.features.reduce((acc: any, feature: any) => {
        const key = feature.name
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        acc[key] = { name: feature.name, enabled: feature.included };
        return acc;
      }, {}),
    };

    console.log(payload);

    try {
      await createsubscriptionPlan(payload).unwrap();
      toast.success("Plan created successfully");
    } catch (error) {
      toast.error("Failed to create plan");
    }
  };

  const updatePlan = async (id: string, data: Partial<Plan>) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...data } : plan))
    );
    toast.success("Plan updated successfully");
  };

  const deletePlan = async (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
    toast.success("Plan deleted successfully");
  };

  const togglePlanStatus = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      await updatePlan(id, { isActive: !plan.isActive });
    }
  };

  return {
    plans,
    planStats,
    isFetching,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
  };
}
