import api from "./api";

export const reportService = {
  getReports: async (params = {}) => {
    const response = await api.get("/reports", {
      params,
    });
    return response.data;
  },

  batchDeleteReports: async (fromDateOrPayload, toDate) => {
    let payload = {};
    if (typeof fromDateOrPayload === "object" && fromDateOrPayload !== null) {
      payload = {
        from_date: fromDateOrPayload.fromDate || fromDateOrPayload.from_date,
        to_date: fromDateOrPayload.toDate || fromDateOrPayload.to_date,
      };
    } else {
      payload = {
        from_date: fromDateOrPayload,
        to_date: toDate,
      };
    }

    const response = await api.post("/reports/batch-delete", payload);
    return response.data;
  },
};
