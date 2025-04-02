import { useState, useEffect } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";
import UpdateDataModal from "./UpdateDataModal";
import DeleteDialog from "./DeleteDialog";
import AddDataModal from "./AddDataModal";
import AddNoteModal from "./AddNoteModal";
import toast from "react-hot-toast";
import { styled } from '@mui/system';

// Styled component for user info
const UserInfoBox = styled(Box)({
  position: 'absolute',
  top: 10,
  right: 20, 
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: '#fff',
  borderRadius: '6px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
});

function TableComponent() {
  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
  ];
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentMonth = months[currentMonthIndex];
  const currentYear = currentDate.getFullYear();

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const [tableData, setTableData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(months);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedExecutors, setSelectedExecutors] = useState([]);
  const [availableExecutors, setAvailableExecutors] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAddNoteModal, setOpenAddNoteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ id: '', fullname: '', role: '' });

  // Fetch user data from /api/Auth/Me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Autentifikasiya tokeni tapılmadı');
      return;
    }

    fetch('http://192.168.100.123:5051/api/Auth/Me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP xətası! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setUserData({
          id: data.id,
          fullname: data.fullname,
          role: data.role,
        });
      })
      .catch((error) => {
        console.error('İstifadəçi məlumatlarını çəkməkdə xəta:', error);
        toast.error('İstifadəçi məlumatları çəkilə bilmədi');
      });
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

        const response = await fetch("http://192.168.100.123:5051/api/Executors/GetAll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
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
          ? selectedMonths.map((month) => {
              const monthIndex = months.indexOf(month) + 1;
              return monthIndex > 0 ? `Months=${monthIndex}` : null;
            }).filter((param) => param !== null).join("&")
          : "";

      const executorParams =
        selectedExecutors.length > 0
          ? selectedExecutors.map((id) => `ExecutorIds=${id}`).join("&")
          : "";

      const queryParams = [executorParams, `Year=${selectedYear}`, monthParams]
        .filter((param) => param)
        .join("&");

      const url = `http://192.168.100.123:5051/api/StrategyEvents/GetAll${queryParams ? `?${queryParams}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token");
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

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === "string" ? value.split(",") : value;
    setSelectedMonths(newSelection.length === 0 ? [] : newSelection.filter((month) => months.includes(month)));
  };

  const handleSelectAllMonths = (event) => {
    if (event.target.checked) setSelectedMonths([...months]);
    else setSelectedMonths([]);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleExecutorChange = (event) => {
    const value = event.target.value;
    setSelectedExecutors(typeof value === "string" ? value.split(",") : value);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://192.168.100.123:5051/api/StrategyEvents/Delete/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setTableData(tableData.filter((row) => row.id !== deleteId));
      setOpenDeleteDialog(false);
      setDeleteId(null);
      toast.success('Məlumat silindi');
    } catch (error) {
      console.error("Error deleting data:", error);
      setError(error.message);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  const handleUpdateClick = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://192.168.100.123:5051/api/StrategyEvents/GetById/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setUpdateData(result);
      setOpenUpdateDialog(true);
    } catch (error) {
      console.error("Error fetching update data:", error);
      setError(error.message);
    }
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setUpdateData(null);
  };

  const handleSaveUpdate = (updatedData) => {
    if (!updatedData || !updatedData.id) {
      console.error("Yenilənmiş məlumat düzgün formatda deyil:", updatedData);
      toast.error("Məlumat yenilənərkən xəta baş verdi");
      return;
    }
    setTableData((prev) => prev.map((row) => (row.id === updatedData.id ? updatedData : row)));
    handleCloseUpdateDialog();
  };

  const handleAddData = async (newData) => {
    if (!newData || !newData.id) {
      console.error("Yeni məlumat düzgün formatda deyil:", newData);
      toast.error("Tədbir əlavə edilərkən xəta baş verdi");
      return;
    }
    await fetchData();
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenAddNoteModal = (eventId) => {
    setSelectedEventId(eventId);
    setOpenAddNoteModal(true);
  };

  const handleCloseAddNoteModal = () => {
    setOpenAddNoteModal(false);
    setSelectedEventId(null);
  };

  const handleAddNote = (newNote) => {
    if (!newNote || !newNote.strategyEventId) {
      console.error("Yeni qeyd düzgün formatda deyil:", newNote);
      toast.error("Qeyd əlavə edilərkən xəta baş verdi");
      return;
    }
    setTableData((prev) =>
      prev.map((row) =>
        row.id === newNote.strategyEventId ? { ...row, notes: [...row.notes, newNote] } : row
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Sistemdən uğurla çıxış etdiniz!");
    window.location.reload();
  };

  const isAllSelected = selectedMonths.length === months.length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6" color="textSecondary">Yüklənir...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6" color="error">Xəta: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "40px 20px", backgroundColor: "#f4f6f8", minHeight: "100vh", position: 'relative' }}>
      {/* User Info in Top Right Corner */}
      {userData.fullname && (
        <UserInfoBox>
          <Typography variant="body1" sx={{ fontWeight: '500' }}>
            {userData.fullname}
          </Typography>
        </UserInfoBox>
      )}

      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, mt: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1a3c34" }}>Strategiya Planı</Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "#d32f2f",
            "&:hover": { backgroundColor: "#b71c1c", transform: "scale(1.02)", transition: "all 0.3s ease" },
          }}
        >
          Çıxış
        </Button>
      </Box>

      {/* Filters Section */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, p: 3, backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="year-select-label">İl</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            onChange={handleYearChange}
            label="İl"
            sx={{ borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a3c34" } }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="month-select-label">Aylar</InputLabel>
          <Select
            labelId="month-select-label"
            multiple
            value={selectedMonths}
            onChange={handleMonthChange}
            renderValue={(selected) => selected.join(", ")}
            label="Aylar"
            sx={{ borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a3c34" } }}
          >
            <MenuItem onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={isAllSelected} onChange={handleSelectAllMonths} onClick={(e) => e.stopPropagation()} />
              <ListItemText primary="Hamısını seç" />
            </MenuItem>
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                <Checkbox checked={selectedMonths.indexOf(month) > -1} />
                <ListItemText primary={month} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="executor-select-label">İcraçılar</InputLabel>
          <Select
            labelId="executor-select-label"
            multiple
            value={selectedExecutors}
            onChange={handleExecutorChange}
            renderValue={(selected) =>
              selected.map((id) => availableExecutors.find((exec) => exec.id === id)?.name).filter(Boolean).join(", ")
            }
            label="İcraçılar"
            sx={{ borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a3c34" } }}
          >
            {availableExecutors.map((executor) => (
              <MenuItem key={executor.id} value={executor.id}>
                <Checkbox checked={selectedExecutors.indexOf(executor.id) > -1} />
                <ListItemText primary={executor.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleOpenAddModal}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "#1a3c34",
            "&:hover": { backgroundColor: "#155a4a", transform: "scale(1.02)", transition: "all 0.3s ease" },
          }}
        >
          Əlavə Et +
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", backgroundColor: "#ffffff" }}>
        <MuiTable sx={{ minWidth: 650, "& .MuiTableCell-root": { padding: "12px 16px", fontSize: "0.9rem", borderBottom: "1px solid #e0e0e0" } }} aria-label="project table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1a3c34", "& .MuiTableCell-head": { color: "#ffffff", fontWeight: 600, fontSize: "0.95rem" } }}>
              <TableCell sx={{ minWidth: 30 }}>Nömrə</TableCell>
              <TableCell sx={{ minWidth: 250 }}>Strategiya üzrə tədbirlər</TableCell>
              <TableCell sx={{ minWidth: 250 }}>İcraçılar</TableCell>
              <TableCell sx={{ minWidth: 110 }}>Başlama Tarixi</TableCell>
              <TableCell sx={{ minWidth: 110 }}>Bitmə Tarixi</TableCell>
              <TableCell sx={{ minWidth: 100 }}>İcra Faizi</TableCell>
              {selectedMonths.map((month) => (
                <TableCell key={month} sx={{ minWidth: 200 }}>{month} Qeyd</TableCell>
              ))}
              <TableCell sx={{ minWidth: 200 }}>Əməliyyatlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.filter((row) => row && typeof row === "object" && row.id).map((row) => (
              <TableRow key={row.id} sx={{ "&:hover": { backgroundColor: "#f4f6f8", transition: "background-color 0.3s ease" } }}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.executors?.map((exec) => exec.name).join(", ") || "Yoxdur"}</TableCell>
                <TableCell>{row.startDate ? new Date(row.startDate).toLocaleDateString() : "Yoxdur"}</TableCell>
                <TableCell>{row.endDate ? new Date(row.endDate).toLocaleDateString() : "Yoxdur"}</TableCell>
                <TableCell>
                  {isNaN(parseFloat(row.percentage)) ? (
                    row.percentage
                  ) : (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        color: parseFloat(row.percentage) >= 75 ? "#2e7d32" : parseFloat(row.percentage) >= 50 ? "#ed6c02" : "#d32f2f",
                        fontWeight: 500,
                      }}
                    >
                      {`${parseFloat(row.percentage)}%`}
                    </Box>
                  )}
                </TableCell>
                {selectedMonths.map((month) => {
                  const monthIndex = months.indexOf(month) + 1;
                  const matchingNotes = row.notes?.filter((n) => n?.month === monthIndex) || [];
                  const displayContent = matchingNotes.length > 0 ? matchingNotes.map((note) => note.content).join("; ") : "Məlumat yoxdur";
                  return <TableCell key={month}>{displayContent}</TableCell>;
                })}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {userData.role !== "Regular" && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(row.id)}
                        sx={{
                          borderRadius: "7px",
                          textTransform: "none",
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          "&:hover": { backgroundColor: "#d32f2f", color: "#ffffff", borderColor: "#d32f2f", transform: "scale(1.02)", transition: "all 0.3s ease" },
                        }}
                      >
                        Sil
                      </Button>
                    )}
                    {row.canUpdate && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleUpdateClick(row.id)}
                          sx={{
                            borderRadius: "7px",
                            textTransform: "none",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            "&:hover": { backgroundColor: "#1a3c34", color: "#ffffff", borderColor: "#1a3c34", transform: "scale(1.02)", transition: "all 0.3s ease" },
                          }}
                        >
                          Redaktə
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleOpenAddNoteModal(row.id)}
                          sx={{
                            borderRadius: "7px",
                            textTransform: "none",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            "&:hover": { backgroundColor: "#2e7d32", color: "#ffffff", borderColor: "#2e7d32", transform: "scale(1.02)", transition: "all 0.3s ease" },
                          }}
                        >
                          Yeni Qeyd
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <DeleteDialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} onConfirm={handleConfirmDelete} />
      <UpdateDataModal open={openUpdateDialog} onClose={handleCloseUpdateDialog} updateData={updateData} setUpdateData={setUpdateData} onSave={handleSaveUpdate} />
      <AddDataModal open={openAddModal} onClose={handleCloseAddModal} onAddData={handleAddData} />
      <AddNoteModal open={openAddNoteModal} onClose={handleCloseAddNoteModal} eventId={selectedEventId} onAddNote={handleAddNote} />
    </Box>
  );
}

export default TableComponent;