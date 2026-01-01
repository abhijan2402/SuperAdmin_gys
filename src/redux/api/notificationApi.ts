import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
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
  tagTypes: ["notifications"],
  endpoints: (builder) => ({
    getNotificationDashboard: builder.query({
      query: () => "admin/notifications/dashboard/summary",
      providesTags: ["notifications"],
    }),
    getNotificationList: builder.query({
      query: () => "admin/notifications",
      providesTags: ["notifications"],
    }),
    getNotificationStats: builder.query({
      query: () => "admin/notifications/stats",
      providesTags: ["notifications"],
    }),
    getUnreadNotifications: builder.query({
      query: () => "admin/notifications/unread/count",
      providesTags: ["notifications"],
    }),
    getExportNotifications: builder.query<
      string,
      { type: string; status: string }
    >({
      query: ({ type, status }) => ({
        url: `admin/notifications/export/csv?type=${type}&status=${status}`,
        responseHandler: (response) => response.text(),
      }),
    }),

    addNotification: builder.mutation({
      query: (body) => ({
        url: `admin/notifications`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["notifications"],
    }),

    markNotificationAsRead: builder.mutation({
      query: (id: string) => ({
        url: `admin/notifications/${id}/read`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["notifications"],
    }),
    deleteNotificationApi: builder.mutation({
      query: (id: string) => ({
        url: `admin/notifications/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useAddNotificationMutation,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationApiMutation,
  useGetNotificationListQuery,
  useGetNotificationDashboardQuery,
  useGetExportNotificationsQuery,
  useGetNotificationStatsQuery,
  useGetUnreadNotificationsQuery,
} = notificationApi;
