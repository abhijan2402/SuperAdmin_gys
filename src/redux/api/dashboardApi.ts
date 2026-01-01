import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
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
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => "admin/dashboard/overview",
      providesTags: ["dashboard"],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
