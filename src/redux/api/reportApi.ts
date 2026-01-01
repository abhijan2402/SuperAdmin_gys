import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reportApi = createApi({
  reducerPath: "reportApi",
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
  tagTypes: ["report"],
  endpoints: (builder) => ({
    /* ----------- LIST ----------- */
    getreport: builder.query({
      query: () => "admin/report",
      providesTags: ["report"],
    }),
    getReportStats: builder.query({
      query: () => "admin/report/stats",
      providesTags: ["report"],
    }),
    getReportScheduledsList: builder.query({
      query: () => "admin/report/scheduled/list",
      providesTags: ["report"],
    }),

    /* ----------- STATUS UPDATE ----------- */
    updateTicketStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `admin/ticket/status/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["report"],
    }),

    /* ----------- REPLY ----------- */
    replyToTicket: builder.mutation({
      query: ({ id, body }) => ({
        url: `admin/ticket/${id}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["report"],
    }),
  }),
});

export const {
  useGetreportQuery,
  useUpdateTicketStatusMutation,
  useReplyToTicketMutation,
} = reportApi;
