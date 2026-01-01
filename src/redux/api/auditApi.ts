import { AuditOverviewResponse } from "@/types/auditLog";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("superadmin_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["audit"],
  endpoints: (builder) => ({
    getAudit: builder.query({
      query: () => "admin/audit-log",
      providesTags: ["audit"],
    }),
    getAuditOverview: builder.query<AuditOverviewResponse, void>({
      query: () => "admin/audit-log/dashboard/overview",
      providesTags: ["audit"],
    }),
    getAuditDetails: builder.query({
      query: (id) => `admin/audit-log/${id}`,
      providesTags: ["audit"],
    }),
  }),
});

export const {
  useGetAuditQuery,
  useGetAuditOverviewQuery,
  useGetAuditDetailsQuery,
} = auditApi;
