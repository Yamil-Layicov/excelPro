import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useStrategyData = ({ selectedMonths, selectedYear, selectedExecutors, months }) => {
  const [tableData, setTableData] = useState([]);
  const [availableExecutors, setAvailableExecutors] = useState([]);
  const [userData, setUserData] = useState({ id: "", fullname: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Autentifikasiya tokeni tapılmadı");
          return;
        }

        const response = await fetch("http://192.168.100.123:5051/api/Auth/Me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP xətası! Status: ${response.status}`);
        const data = await response.json();
        setUserData({
          id: data.id,
          fullname: data.fullname,
          role: data.role,
        });
      } catch (error) {
        console.error("İstifadəçi məlumatlarını çəkməkdə xəta:", error);
        toast.error("İstifadəçi məlumatları çəkilə bilmədi");
      }
    };

    fetchUserData();
  }, []);

  // Fetch executors
  useEffect(() => {
    const fetchExecutors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Autentifikasiya tokeni tapılmadı");
          return;
        }

        const response = await fetch(
          "http://192.168.100.123:5051/api/Executors/GetAll",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            toast.error("Sessiya başa çatdı. Zəhmət olmasa yenidən daxil olun.");
            window.location.reload();
          }
          throw new Error(`HTTP xətası! Status: ${response.status}`);
        }

        const data = await response.json();
        setAvailableExecutors(data.data || []);
      } catch (error) {
        console.error("Icraçıları çəkməkdə xəta:", error);
        setAvailableExecutors([]);
      }
    };

    fetchExecutors();
  }, []);

  // Fetch table data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const monthParams =
        selectedMonths.length > 0
          ? selectedMonths
              .map((month) => {
                const monthIndex = months.indexOf(month) + 1;
                return monthIndex > 0 ? `Months=${monthIndex}` : null;
              })
              .filter((param) => param !== null)
              .join("&")
          : "";

      const executorParams =
        selectedExecutors.length > 0
          ? selectedExecutors.map((id) => `ExecutorIds=${id}`).join("&")
          : "";

      const queryParams = [executorParams, `Year=${selectedYear}`, monthParams]
        .filter((param) => param)
        .join("&");

      const url = `http://192.168.100.123:5051/api/StrategyEvents/GetAll${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Sessiya başa çatdı. Zəhmət olmasa yenidən daxil olun.");
          window.location.reload();
          throw new Error("Unauthorized: Invalid or expired token");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!Array.isArray(result.data)) {
        console.error("API-dan gələn məlumat array deyil:", result.data);
        setTableData([]);
      } else {
        setTableData(result.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonths, selectedYear, selectedExecutors]);

  // Delete data
  const handleConfirmDelete = async (deleteId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://192.168.100.123:5051/api/StrategyEvents/Delete/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setTableData(tableData.filter((row) => row.id !== deleteId));
      toast.success("Məlumat silindi");
    } catch (error) {
      console.error("Error deleting data:", error);
      setError(error.message);
    }
  };

  // Save updated data
  const handleSaveUpdate = (updatedData) => {
    if (!updatedData || !updatedData.id) {
      console.error("Yenilənmiş məlumat düzgün formatda deyil:", updatedData);
      toast.error("Məlumat yenilənərkən xəta baş verdi");
      return;
    }
    setTableData((prev) =>
      prev.map((row) => (row.id === updatedData.id ? updatedData : row))
    );
  };

  // Add new data
  const handleAddData = async (newData) => {
    if (!newData || !newData.id) {
      console.error("Yeni məlumat düzgün formatda deyil:", newData);
      toast.error("Tədbir əlavə edilərkən xəta baş verdi");
      return;
    }
    await fetchData();
  };

  // Add new note
  const handleAddNote = (newNote) => {
    if (!newNote || !newNote.strategyEventId) {
      console.error("Yeni qeyd düzgün formatda deyil:", newNote);
      toast.error("Qeyd əlavə edilərkən xəta baş verdi");
      return;
    }
    setTableData((prev) =>
      prev.map((row) =>
        row.id === newNote.strategyEventId
          ? { ...row, notes: [...row.notes, newNote] }
          : row
      )
    );
  };

  return {
    tableData,
    availableExecutors,
    userData,
    loading,
    error,
    fetchData,
    handleConfirmDelete,
    handleSaveUpdate,
    handleAddData,
    handleAddNote,
  };
};

export default useStrategyData;