import { useState } from 'react';
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
  TextField,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check'; // Bu sətir düzgün olmalıdır

function Table({ data, onOpenModal, onDelete, onUpdate }) {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentMonth = months[currentMonthIndex];
  const [selectedMonths, setSelectedMonths] = useState([currentMonth]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const isAdmin = true;

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === 'string' ? value.split(',') : value;
    setSelectedMonths(newSelection.length === 0 ? [currentMonth] : newSelection);
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

  const handleDoubleClick = (id, field, initialValue) => {
    if (isAdmin || field.startsWith('status.')) {
      setEditCell({ id, field });
      setEditValue(initialValue);
    }
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditConfirm = (row) => {
    const { id, field } = editCell;
    let updatedRow = { ...row };

    if (field.startsWith('status.')) {
      const month = field.split('.')[1];
      updatedRow.status = { ...row.status, [month]: editValue };
    } else {
      updatedRow[field] = editValue;
    }

    onUpdate(updatedRow);
    setEditCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e, row) => {
    if (e.key === 'Enter') {
      handleEditConfirm(row);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                <Checkbox checked={selectedMonths.indexOf(month) > -1} />
                <ListItemText primary={month} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={onOpenModal}>
          Əlavə Et
        </Button>
      </div>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <MuiTable sx={{ minWidth: 650 }} aria-label="project table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 80 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 200 }}>Tədbir</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 150 }}>İcraçılar</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 120 }}>Başlama Tarixi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 120 }}>Bitmə Tarixi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 100 }}>İcra Faizi</TableCell>
              {selectedMonths.map((month) => (
                <TableCell
                  key={month}
                  sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', minWidth: 200 }}
                >
                  {month} Statusu
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Əməliyyatlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.id}</TableCell>
                <TableCell
                  sx={{ borderRight: '1px solid #e0e0e0' }}
                  onDoubleClick={() => handleDoubleClick(row.id, 'event', row.event)}
                >
                  {editCell?.id === row.id && editCell?.field === 'event' ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={(e) => handleKeyPress(e, row)}
                        autoFocus
                        fullWidth
                        size="small"
                      />
                      <IconButton size="small" onClick={() => handleEditConfirm(row)}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ) : (
                    row.event
                  )}
                </TableCell>
                <TableCell
                  sx={{ borderRight: '1px solid #e0e0e0' }}
                  onDoubleClick={() => handleDoubleClick(row.id, 'executors', row.executors)}
                >
                  {editCell?.id === row.id && editCell?.field === 'executors' ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={(e) => handleKeyPress(e, row)}
                        autoFocus
                        fullWidth
                        size="small"
                      />
                      <IconButton size="small" onClick={() => handleEditConfirm(row)}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ) : (
                    row.executors
                  )}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.startDate}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.endDate}</TableCell>
                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                  {(row.progress * 100).toFixed(0)}%
                </TableCell>
                {selectedMonths.map((month) => (
                  <TableCell
                    key={month}
                    sx={{ borderRight: '1px solid #e0e0e0' }}
                    onDoubleClick={() => handleDoubleClick(row.id, `status.${month}`, row.status[month] || '')}
                  >
                    {editCell?.id === row.id && editCell?.field === `status.${month}` ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          value={editValue}
                          onChange={handleEditChange}
                          onKeyDown={(e) => handleKeyPress(e, row)}
                          autoFocus
                          fullWidth
                          size="small"
                        />
                        <IconButton size="small" onClick={() => handleEditConfirm(row)}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ) : (
                      row.status[month] || 'Məlumat yoxdur'
                    )}
                  </TableCell>
                ))}
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