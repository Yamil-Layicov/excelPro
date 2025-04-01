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
} from "@mui/material";
import UpdateDataModal from "./UpdateDataModal";
import DeleteDialog from "./DeleteDialog";
import AddDataModal from "./AddDataModal";
import AddNoteModal from "./AddNoteModal";
import toast from "react-hot-toast";

function Table() {
  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
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
  const [availableExecutors, setAvailableExecutors] = useState([]); // İcraçıların siyahısı üçün state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAddNoteModal, setOpenAddNoteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // İcraçıları çəkmək üçün useEffect
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Əgər selectedMonths boş deyilsə, monthParams yaradılır
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

      // Əgər selectedExecutors varsa, ExecutorIds parametrləri əlavə olunur
      const executorParams =
        selectedExecutors.length > 0
          ? selectedExecutors.map((id) => `ExecutorIds=${id}`).join("&")
          : "";

      // URL-i dinamik olaraq yaradırıq
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
  }, [selectedMonths, selectedYear, selectedExecutors]); // selectedExecutor əlavə edildi

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === "string" ? value.split(",") : value;
    setSelectedMonths(
      newSelection.length === 0
        ? []
        : newSelection.filter((month) => months.includes(month))
    );
  };

  const handleSelectAllMonths = (event) => {
    if (event.target.checked) {
      setSelectedMonths([...months]);
    } else {
      setSelectedMonths([]);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleExecutorChange = (event) => {
    const value = event.target.value;
    setSelectedExecutors(typeof value === "string" ? value.split(",") : value);
  };

  const handleSelectAllExecutors = (event) => {
    if (event.target.checked) {
      setSelectedExecutors(availableExecutors.map((executor) => executor.id));
    } else {
      setSelectedExecutors([]);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTableData(tableData.filter((row) => row.id !== deleteId));
      setOpenDeleteDialog(false);
      setDeleteId(null);
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
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://192.168.100.123:5051/api/StrategyEvents/GetById/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

    setTableData((prev) =>
      prev.map((row) => (row.id === updatedData.id ? updatedData : row))
    );
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
        row.id === newNote.strategyEventId
          ? { ...row, notes: [...row.notes, newNote] }
          : row
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label">İl</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYear}
              onChange={handleYearChange}
              label="İl"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
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
            >
              <MenuItem onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAllMonths}
                  onClick={(e) => e.stopPropagation()}
                />
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
                selected
                  .map(
                    (id) =>
                      availableExecutors.find((exec) => exec.id === id)?.name
                  )
                  .filter(Boolean)
                  .join(", ")
              }
              label="İcraçılar"
            >
              <MenuItem onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={
                    selectedExecutors.length === availableExecutors.length
                  }
                  onChange={handleSelectAllExecutors}
                  onClick={(e) => e.stopPropagation()}
                />
                <ListItemText primary="Hamısını seç" />
              </MenuItem>
              {availableExecutors.map((executor) => (
                <MenuItem key={executor.id} value={executor.id}>
                  <Checkbox
                    checked={selectedExecutors.indexOf(executor.id) > -1}
                  />
                  <ListItemText primary={executor.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <Button variant="contained" onClick={handleOpenAddModal}>
            Əlavə Et
          </Button>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Çıxış
          </Button>
        </div>
      </div>

      <TableContainer
        component={Paper}
        sx={{ maxWidth: "100%", overflowX: "auto" }}
      >
        <MuiTable sx={{ minWidth: 650 }} aria-label="project table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 80,
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 200,
                }}
              >
                Strategiya üzrə tədbirlər
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 150,
                }}
              >
                İcraçılar
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 120,
                }}
              >
                Başlama Tarixi
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 120,
                }}
              >
                Bitmə Tarixi
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  minWidth: 100,
                }}
              >
                İcra Faizi
              </TableCell>
              {selectedMonths.map((month) => (
                <TableCell
                  key={month}
                  sx={{
                    fontWeight: "bold",
                    borderRight: "1px solid #e0e0e0",
                    minWidth: 200,
                  }}
                >
                  {month} Qeyd
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                Əməliyyatlar
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData
              .filter((row) => row && typeof row === "object" && row.id)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.title}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.executors?.map((exec) => exec.name).join(", ") ||
                      "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.startDate
                      ? new Date(row.startDate).toLocaleDateString()
                      : "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.endDate
                      ? new Date(row.endDate).toLocaleDateString()
                      : "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {isNaN(parseFloat(row.percentage))
                      ? row.percentage
                      : `${parseFloat(row.percentage)}%`}
                  </TableCell>
                  {selectedMonths.map((month) => {
                    const monthIndex = months.indexOf(month) + 1;
                    const matchingNotes =
                      row.notes?.filter((n) => n?.month === monthIndex) || [];
                    const displayContent =
                      matchingNotes.length > 0
                        ? matchingNotes.map((note) => note.content).join("; ")
                        : "Məlumat yoxdur";
                    return (
                      <TableCell
                        key={month}
                        sx={{ borderRight: "1px solid #e0e0e0" }}
                      >
                        {displayContent}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(row.id)}
                        sx={{
                          fontSize: "0.75rem",
                          width: "60px",
                          height: "28px",
                          minWidth: "unset",
                          padding: "4px 8px",
                          textTransform: "capitalize",
                        }}
                      >
                        Sil
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateClick(row.id)}
                        sx={{
                          fontSize: "0.75rem",
                          width: "60px",
                          height: "28px",
                          minWidth: "unset",
                          padding: "4px 8px",
                          textTransform: "capitalize",
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
                          fontSize: "0.75rem",
                          width: "90px",
                          height: "28px",
                          minWidth: "unset",
                          padding: "4px 8px",
                          textTransform: "capitalize",
                        }}
                      >
                        Yeni Qeyd
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <DeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <UpdateDataModal
        open={openUpdateDialog}
        onClose={handleCloseUpdateDialog}
        updateData={updateData}
        setUpdateData={setUpdateData}
        onSave={handleSaveUpdate}
      />

      <AddDataModal
        open={openAddModal}
        onClose={handleCloseAddModal}
        onAddData={handleAddData}
      />

      <AddNoteModal
        open={openAddNoteModal}
        onClose={handleCloseAddNoteModal}
        eventId={selectedEventId}
        onAddNote={handleAddNote}
      />
    </div>
  );
}

export default Table;
