import { useState, useEffect } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

function Table({ onOpenModal, onDelete }) {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentMonth = months[currentMonthIndex];
  const currentYear = currentDate.getFullYear();
  
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const [tableData, setTableData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([currentMonth]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // `monthParams` hesablanarkən 0-cı ayın qarşısını alırıq
        const monthParams = selectedMonths
          .map(month => {
            const monthIndex = months.indexOf(month) + 1;
            return monthIndex > 0 ? `Months=${monthIndex}` : null; // 0 və ya mənfi dəyərləri çıxarırıq
          })
          .filter(param => param !== null) // Null dəyərləri filtr edirik
          .join('&');
        const url = `http://192.168.100.123:5051/api/StrategyEvents/GetAll?${monthParams}&Year=${selectedYear}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setTableData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonths, selectedYear]);

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === 'string' ? value.split(',') : value;
    // Boş seçim olarsa cari ayı saxla, yoxsa yalnız months array-indəki dəyərləri qəbul et
    setSelectedMonths(newSelection.length === 0 ? [currentMonth] : newSelection.filter(month => months.includes(month)));
  };

  // "Hamısını seç" funksiyası - yalnız months array-indəki dəyərləri seçir
  const handleSelectAllMonths = (event) => {
    if (event.target.checked) {
      setSelectedMonths([...months]); // Yalnız Yanvar-Dekabr (1-12) seçilir
    } else {
      setSelectedMonths([currentMonth]); // Cari aya qayıt
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deleteId);
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        gap: '20px' 
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
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
              renderValue={(selected) => selected.join(', ')}
              label="Aylar"
            >
              {/* "Hamısını seç" yazısına klik edəndə heç nə olmasın */}
              <MenuItem onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAllMonths} // Yalnız checkbox-a klik edəndə işləsin
                  onClick={(e) => e.stopPropagation()} // Klikin yayılmasını dayandır
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

        <Button variant="contained" onClick={onOpenModal}>
          Əlavə Et
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <MuiTable sx={{ minWidth: 650 }} aria-label="project table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 80 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 200 }}>Strategiya üzrə tədbirlər</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 150 }}>İcraçılar</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 120 }}>Başlama Tarixi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 120 }}>Bitmə Tarixi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 100 }}>İcra Faizi</TableCell>
              {selectedMonths.map((month) => (
                <TableCell
                  key={month}
                  sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 200 }}
                >
                  {month} Qeyd
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Əməliyyatlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.id.slice(0, 8)}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.title}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {row.executors.map(exec => exec.name).join(', ')}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {new Date(row.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {new Date(row.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {isNaN(parseFloat(row.percentage)) ? row.percentage : `${parseFloat(row.percentage)}%`}
                </TableCell>
                {selectedMonths.map((month) => {
                  const monthIndex = months.indexOf(month) + 1;
                  const matchingNotes = row.notes.filter(n => n.month === monthIndex);
                  const displayContent = matchingNotes.length > 0 
                    ? matchingNotes.map(note => note.content).join(';  ')
                    : 'Məlumat yoxdur';
                  return (
                    <TableCell
                      key={month}
                      sx={{ borderRight: '1px solid #e0e0e0' }}
                    >
                      {displayContent}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteClick(row.id)}
                  >
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Silmək istədiyinizə əminsiniz?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu sətri silmək istədiyinizə əmin olun. Bu əməliyyat geri qaytarıla bilməz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Xeyr
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Bəli
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Table;