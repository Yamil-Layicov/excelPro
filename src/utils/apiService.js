const BASE_URL = "http://192.168.100.123:5051/api";

const getToken = () => localStorage.getItem("token");

const apiFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const fetchUserData = () => apiFetch("/Auth/Me");
export const fetchExecutors = () => apiFetch("/Executors/GetAll");
export const fetchTableData = (months, year, executorIds) => {
  const monthParams = months.map((month) => `Months=${month}`).join("&");
  const executorParams = executorIds.map((id) => `ExecutorIds=${id}`).join("&");
  const queryParams = [executorParams, `Year=${year}`, monthParams].filter(Boolean).join("&");
  return apiFetch(`/StrategyEvents/GetAll${queryParams ? `?${queryParams}` : ""}`);
};
export const deleteEvent = (id) => apiFetch(`/StrategyEvents/Delete/${id}`, { method: "DELETE" });
export const getEventById = (id) => apiFetch(`/StrategyEvents/GetById/${id}`);