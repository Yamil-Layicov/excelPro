import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormField from './FormField';
import toast from 'react-hot-toast';
import az from 'date-fns/locale/az';

const UpdateDataModal = ({ open, onClose, updateData, setUpdateData, onSave }) => {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

  const [availableExecutors, setAvailableExecutors] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [removedNoteIds, setRemovedNoteIds] = useState([]);
  const [dateError, setDateError] = useState(''); // Xəta mesajı üçün state

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Autentifikasiya tokeni tapılmadı');
        return;
      }

      fetch('http://192.168.100.123:5051/api/Executors/GetAll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP xətası! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setAvailableExecutors(data.data || []);
        })
        .catch((error) => {
          console.error('Icraçıları çəkməkdə xəta:', error);
          setAvailableExecutors([]);
        });

      fetch('http://192.168.100.123:5051/api/Auth/Me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP xətası! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setUserRole(data.role);
        })
        .catch((error) => {
          console.error('İstifadəçi rolu çəkilmədi:', error);
          setUserRole(null);
        });

      setRemovedNoteIds([]);
      validateDates(updateData.startDate, updateData.endDate); // İlkin tarix yoxlaması
    }
  }, [open]);

  // Tarixləri müqayisə edən funksiya
  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError('Başlama Tarixi Bitmə Tarixindən böyük ola bilməz!');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleAddExecutor = (executorId) => {
    const selectedExecutor = availableExecutors.find((exec) => exec.id === executorId);
    if (selectedExecutor && !updateData.executors.some((exec) => exec.id === executorId)) {
      setUpdateData({
        ...updateData,
        executors: [...updateData.executors, selectedExecutor],
      });
    }
  };

  const handleRemoveExecutor = (executorId) => {
    setUpdateData({
      ...updateData,
      executors: updateData.executors.filter((exec) => exec.id !== executorId),
    });
  };

  const handleRemoveNote = (noteId) => {
    if (!updateData.notes.find((note) => note.id === noteId)?.isNew) {
      setRemovedNoteIds((prev) => [...prev, noteId]);
    }
    setUpdateData({
      ...updateData,
      notes: updateData.notes.filter((note) => note.id !== noteId),
    });
  };

  const handleNoteChange = (index, field, value) => {
    const newNotes = [...updateData.notes];
    newNotes[index] = { ...newNotes[index], [field]: value };
    setUpdateData({ ...updateData, notes: newNotes });
  };

  const handlePercentageChange = (e) => {
    let value = e.target.value;
    value = Math.max(1, Math.min(100, Number(value) || 1));
    setUpdateData({ ...updateData, percentage: value });
  };

  // Tarix dəyişdikdə yoxlama
  const handleDateChange = (field) => (newValue) => {
    const updatedData = { ...updateData, [field]: newValue };
    setUpdateData(updatedData);
    validateDates(updatedData.startDate, updatedData.endDate);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Autentifikasiya tokeni tapılmadı');
      return;
    }

    const percentage = Number(updateData.percentage);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      toast.error('İcra Faizi 1 ilə 100 arasında olmalıdır');
      return;
    }

    if (dateError) {
      toast.error(dateError);
      return;
    }

    try {
      for (const noteId of removedNoteIds) {
        const response = await fetch(`http://192.168.100.123:5051/api/Notes/Delete/${noteId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(`Qeyd ${noteId} silinmədi: ${errorData.message || 'Xəta baş verdi'}`);
          return;
        }
      }

      const payload = {
        id: updateData.id,
        title: updateData.title,
        name: updateData.name,
        percentage: percentage.toString(),
        startDate: updateData.startDate ? new Date(updateData.startDate).toISOString() : null,
        endDate: updateData.endDate ? new Date(updateData.endDate).toISOString() : null,
        executorIds: updateData.executors.map((exec) => exec.id),
        notes: updateData.notes.map((note) => ({
          id: note.isNew ? null : note.id,
          content: note.content,
          month: parseInt(note.month) || 0,
          year: parseInt(note.year) || 0,
        })),
      };

      const response = await fetch(`http://192.168.100.123:5051/api/StrategyEvents/Update/${updateData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        onSave(updatedData);
        toast.success('Məlumat uğurla yeniləndi');
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Məlumat yenilənmədi');
      }
    } catch (error) {
      console.error('Xəta baş verdi:', error);
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={az}>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="update-dialog-title"
        fullWidth
        maxWidth="md"
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', py: 2 }}>
          Tədbiri Redaktə Et
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {updateData ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                {userRole !== 'Regular' && (
                  <>
                    <FormField
                      label="Nömrə"
                      value={updateData.title}
                      onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                      sx={{ mt: 2 }}
                    />
                    <FormField
                      label="Strategiya üzrə tədbir"
                      value={updateData.name}
                      onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                      multiline
                      rows={4}
                      sx={{ mt: 2 }}
                    />
                  </>
                )}
                <FormField
                  label="İcra Faizi"
                  value={updateData.percentage}
                  onChange={handlePercentageChange}
                  type="number"
                  inputProps={{ min: 1, max: 100, step: 1 }}
                  sx={{ mt: 2 }}
                />
                {userRole !== 'Regular' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <DatePicker
                        label="Başlama Tarixi"
                        value={updateData.startDate ? new Date(updateData.startDate) : null}
                        onChange={handleDateChange('startDate')}
                        slotProps={{
                          textField: {
                            sx: { flex: 1 },
                            InputLabelProps: { shrink: true },
                          },
                        }}
                      />
                      <DatePicker
                        label="Bitmə Tarixi"
                        value={updateData.endDate ? new Date(updateData.endDate) : null}
                        onChange={handleDateChange('endDate')}
                        slotProps={{
                          textField: {
                            sx: { flex: 1 },
                            InputLabelProps: { shrink: true },
                          },
                        }}
                      />
                    </Box>
                    {dateError && (
                      <Typography color="error" variant="body2">
                        {dateError}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>

              {userRole !== 'Regular' && (
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    İcraçılar
                  </Typography>
                  {updateData.executors.map((executor) => (
                    <Box key={executor.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FormField
                        label="İcraçı"
                        value={executor.name}
                        readOnly
                        sx={{ flex: 1, bgcolor: '#f5f5f5' }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveExecutor(executor.id)}
                        sx={{ ml: 2, borderRadius: 1 }}
                      >
                        Sil
                      </Button>
                    </Box>
                  ))}
                  <FormControl fullWidth>
                    <InputLabel id="add-executor-label">Yeni İcraçı Əlavə Et</InputLabel>
                    <Select
                      labelId="add-executor-label"
                      label="Yeni İcraçı Əlavə Et"
                      onChange={(e) => handleAddExecutor(e.target.value)}
                      value=""
                      sx={{ borderRadius: 1 }}
                    >
                      {availableExecutors
                        .filter((exec) => !updateData.executors.some((e) => e.id === exec.id))
                        .map((executor) => (
                          <MenuItem key={executor.id} value={executor.id}>
                            {executor.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Paper>
              )}

              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  Qeydlər
                </Typography>
                {updateData.notes.map((note, index) => (
                  <Box key={note.id} sx={{ mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                    <FormField
                      label="Qeyd Məzmunu"
                      value={note.content}
                      onChange={(e) => handleNoteChange(index, 'content', e.target.value)}
                      multiline
                      rows={5}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id={`month-select-label-${index}`}>Ay</InputLabel>
                        <Select
                          labelId={`month-select-label-${index}`}
                          value={note.month}
                          onChange={(e) => handleNoteChange(index, 'month', e.target.value)}
                          label="Ay"
                          sx={{ borderRadius: 1 }}
                        >
                          {months.map((month, i) => (
                            <MenuItem key={month} value={i + 1}>
                              {month}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id={`year-select-label-${index}`}>İl</InputLabel>
                        <Select
                          labelId={`year-select-label-${index}`}
                          value={note.year}
                          onChange={(e) => handleNoteChange(index, 'year', e.target.value)}
                          label="İl"
                          sx={{ borderRadius: 1 }}
                        >
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveNote(note.id)}
                      sx={{ mt: 2, borderRadius: 1 }}
                    >
                      Qeyd Sil
                    </Button>
                  </Box>
                ))}
              </Paper>
            </Box>
          ) : (
            <Typography>Yüklənir...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={onClose} variant="outlined" color="primary" sx={{ borderRadius: 1 }}>
            Bağla
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
            disabled={!!dateError} // Xəta varsa düyməni deaktiv edir
          >
            Saxla
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UpdateDataModal;