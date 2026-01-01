import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tenatsApi = createApi({
  reducerPath: "tenatsApi",
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
  tagTypes: ["tenats"],
  endpoints: (builder) => ({
    getTenatList: builder.query({
      query: () => "admin/monitoring/ten-new",
      providesTags: ["tenats"],
    }),
    createTenatPlan: builder.mutation({
      query: (payload) => ({
        url: `admin/monitoring/ten-new`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["tenats"],
    }),
  }),
});

export const {
  useGetTenatListQuery,
  useCreateTenatPlanMutation
} = tenatsApi;
