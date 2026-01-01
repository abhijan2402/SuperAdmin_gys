import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://72.61.232.245:3001/api/",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("superadmin_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["subscription"],
  endpoints: (builder) => ({
    getsubscription: builder.query({
      query: () => "admin/subscriptionPlans",
      providesTags: ["subscription"],
    }),
    getPlansStats: builder.query({
      query: () => "admin/subscriptionPlans/stats/dashboard",
      providesTags: ["subscription"],
    }),

    createsubscriptionPlan: builder.mutation({
      query: (payload) => ({
        url: `admin/subscriptionPlans`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["subscription"],
    }),
    updatePlanStatus: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/subscriptionPlans/${id}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["subscription"],
    }),

    updatePlan: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/subscriptionPlans/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["subscription"],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `admin/subscriptionPlans/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["subscription"],
    }),
  }),
});

export const {
  useGetsubscriptionQuery,
  useGetPlansStatsQuery,
  useCreatesubscriptionPlanMutation,
  useDeletePlanMutation,
  useUpdatePlanMutation,
  useUpdatePlanStatusMutation,
} = subscriptionApi;
