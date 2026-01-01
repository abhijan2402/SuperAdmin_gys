import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
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
  tagTypes: ["invoice"],
  endpoints: (builder) => ({
    getinvoice: builder.query({
      query: () => "admin/invoices",
      providesTags: ["invoice"],
    }),
    getinvoiceDashboard: builder.query({
      query: (period) => `admin/invoices/stats/dashboard?period=${period} `,
      providesTags: ["invoice"],
    }),

    createInvoices: builder.mutation({
      query: (body) => ({
        url: `admin/invoices`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["invoice"],
    }),
    updateInvoices: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/invoices/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["invoice"],
    }),
    updateInvoicesStatus: builder.mutation({
      query: ({ id, payload }) => ({
        url: `admin/invoices/${id}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["invoice"],
    }),

    deleteInvoiceItem: builder.mutation({
      query: (id) => ({
        url: `admin/invoices/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["invoice"],
    }),
  }),
});

export const {
  useGetinvoiceQuery,
  useGetinvoiceDashboardQuery,
  useCreateInvoicesMutation,
  useDeleteInvoiceItemMutation,
  useUpdateInvoicesMutation,
  useUpdateInvoicesStatusMutation,
} = invoiceApi;
