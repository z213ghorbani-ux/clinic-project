import api from "./api";

const reportService = {
  async getReports(params = {}) {
    const response = await api.get("/reports", {
      params,
    });
    return response.data;
  },

  async batchDeleteReports(fromDateOrObject, maybeToDate) {
    const payload =
      typeof fromDateOrObject === "object" && fromDateOrObject !== null
        ? {
            from_date:
              fromDateOrObject.from_date ?? fromDateOrObject.fromDate ?? "",
            to_date: fromDateOrObject.to_date ?? fromDateOrObject.toDate ?? "",
          }
        : {
            from_date: fromDateOrObject,
            to_date: maybeToDate,
          };

    const response = await api.delete("/reports/batch-delete", {
      data: payload,
    });

    return response.data;
  },
};

export default reportService;
