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
  const [selectedMonths, setSelectedMonths] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAddNoteModal, setOpenAddNoteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const monthParams = selectedMonths
          .map((month) => {
            const monthIndex = months.indexOf(month) + 1;
            return monthIndex > 0 ? `Months=${monthIndex}` : null;
          })
          .filter((param) => param !== null)
          .join("&");
        const url = `http://192.168.100.123:5051/api/StrategyEvents/GetAll?${monthParams}&Year=${selectedYear}`;

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

    fetchData();
  }, [selectedMonths, selectedYear]);

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === "string" ? value.split(",") : value;
    setSelectedMonths(
      newSelection.length === 0
        ? [currentMonth]
        : newSelection.filter((month) => months.includes(month))
    );
  };

  const handleSelectAllMonths = (event) => {
    if (event.target.checked) {
      setSelectedMonths([...months]);
    } else {
      setSelectedMonths([currentMonth]);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
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

  const handleAddData = (newData) => {
    setTableData((prev) => [...prev, newData.data]);
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
        </div>

        <Button variant="contained" onClick={handleOpenAddModal}>
          Əlavə Et
        </Button>
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
              .filter((row) => row && typeof row === 'object' && row.id)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.title}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.executors?.map((exec) => exec.name).join(", ") || "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.startDate ? new Date(row.startDate).toLocaleDateString() : "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {row.endDate ? new Date(row.endDate).toLocaleDateString() : "Yoxdur"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {isNaN(parseFloat(row.percentage))
                      ? row.percentage
                      : `${parseFloat(row.percentage)}%`}
                  </TableCell>
                  {selectedMonths.map((month) => {
                    const monthIndex = months.indexOf(month) + 1;
                    const matchingNotes = row.notes?.filter(
                      (n) => n?.month === monthIndex
                    ) || [];
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
                          fontSize: '0.75rem',
                          width: '60px',
                          height: '28px',
                          minWidth: 'unset',
                          padding: '4px 8px',
                          textTransform: 'capitalize',
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
                          fontSize: '0.75rem',
                          width: '60px',
                          height: '28px',
                          minWidth: 'unset',
                          padding: '4px 8px',
                          textTransform: 'capitalize',
                        }}
                      >
                        Yenilə
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleOpenAddNoteModal(row.id)}
                        sx={{
                          fontSize: '0.75rem',
                          width: '90px',
                          height: '28px',
                          minWidth: 'unset',
                          padding: '4px 8px',
                          textTransform: 'capitalize',
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