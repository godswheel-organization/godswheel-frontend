import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api/baseQuery";
import type { ReportReceipt, ReportRequest } from "../types";

// Guests can report too, so this doesn't need a session.
// TODO(backend): path is what the mock backend (lib/api/mock) answers; align with the real spec.
export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery,
  endpoints: (builder) => ({
    submitReport: builder.mutation<ReportReceipt, ReportRequest>({
      query: (body) => ({ url: "/reports", method: "POST", body }),
    }),
  }),
});

export const { useSubmitReportMutation } = reportsApi;
