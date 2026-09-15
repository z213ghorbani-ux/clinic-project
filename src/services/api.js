import api from "./api";

export const getReports = async (params = {}) => {
  const response = await api.get("/reports", {
    params,
  });

  return response.data;
};

export const batchDeleteReports = async (fromDateOrObject, maybeToDate) => {
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

  const response = await api.post("/reports/batch-delete", payload);

  return response.data;
};
