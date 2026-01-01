import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
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
  tagTypes: ["settings"],
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "admin/settings",
      providesTags: ["settings"],
    }),
    getOverviewSettings: builder.query({
      query: () => "admin/settings/dashboard/overview",
      providesTags: ["settings"],
    }),

    generateApiKey: builder.mutation({
      query: (body) => ({
        url: `admin/settings/api-key/generate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["settings"],
    }),

    getApiKeyList: builder.query({
      query: () => "admin/settings/api-key/list",
      providesTags: ["settings"],
    }),

    createWebHook: builder.mutation({
      query: (body) => ({
        url: `admin/settings/webhook`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["settings"],
    }),

    getWebHookList: builder.query({
      query: () => "admin/settings/webhook/list",
      providesTags: ["settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetWebHookListQuery,
  useGetApiKeyListQuery,
  useCreateWebHookMutation,
  useGenerateApiKeyMutation,
  useGetOverviewSettingsQuery,
} = settingsApi;
