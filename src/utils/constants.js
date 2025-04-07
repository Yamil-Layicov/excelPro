export const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
export const getYears = (currentYear) => Array.from({ length: 6 }, (_, i) => currentYear + i);

export const tableStyles = {
  container: { maxWidth: "100%", overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
  cell: { padding: "12px 16px", fontSize: "0.9rem", borderBottom: "1px solid #e0e0e0" },
};