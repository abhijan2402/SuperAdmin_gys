import { configureStore } from "@reduxjs/toolkit";
import { ticketListApi } from "../api/ticketListApi";
import { notificationApi } from "../api/notificationApi";
import { auditApi } from "../api/auditApi";
import { settingsApi } from "../api/settingsApi";
import { reportApi } from "../api/reportApi";
import { invoiceApi } from "../api/invoiceApi";
import { subscriptionApi } from "../api/subscriptionApi";
import { tenatsApi } from "../api/tenatsApi";
import { dashboardApi } from "../api/dashboardApi";

export const store = configureStore({
  reducer: {
    [ticketListApi.reducerPath]: ticketListApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [tenatsApi.reducerPath]: tenatsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(ticketListApi.middleware)
      .concat(notificationApi.middleware)
      .concat(auditApi.middleware)
      .concat(settingsApi.middleware)
      .concat(reportApi.middleware)
      .concat(invoiceApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(tenatsApi.middleware)
      .concat(dashboardApi.middleware),
});
