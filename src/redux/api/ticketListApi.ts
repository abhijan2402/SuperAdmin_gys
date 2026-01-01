import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketListApi = createApi({
  reducerPath: "ticketListApi",
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
  tagTypes: ["ticketList"],
  endpoints: (builder) => ({
    getTicketList: builder.query({
      query: () => "admin/tickets",
      providesTags: ["ticketList"],
    }),
    getTicketStats: builder.query({
      query: () => "admin/tickets/stats",
      providesTags: ["ticketList"],
    }),

    /* ----------- STATUS UPDATE ----------- */
    updateStatus: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/tickets/${id}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["ticketList"],
    }),

    /* ----------- REPLY ----------- */
    replyToTicket: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/tickets/${id}/reply`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ticketList"],
    }),
  }),
});

export const {
  useGetTicketListQuery,
  useGetTicketStatsQuery,
  useUpdateStatusMutation,
  useReplyToTicketMutation,
} = ticketListApi;
