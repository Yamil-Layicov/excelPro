import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import FormField from './FormField';
import toast from 'react-hot-toast';

const UpdateDataModal = ({ open, onClose, updateData, setUpdateData, onSave }) => {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const [availableExecutors, setAvailableExecutors] = useState([]);

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
    }
  }, [open]);

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

  const handleAddNote = () => {
    setUpdateData({
      ...updateData,
      notes: [...updateData.notes, { id: Date.now().toString(), content: '', month: '', year: '' }],
    });
  };

  const handleRemoveNote = (noteId) => {
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

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Autentifikasiya tokeni tapılmadı');
      return;
    }

    const payload = {
      id: updateData.id,
      title: updateData.title,
      name: updateData.name,
      percentage: updateData.percentage.toString(),
      startDate: new Date(updateData.startDate).toISOString(),
      endDate: new Date(updateData.endDate).toISOString(),
      executorIds: updateData.executors.map((exec) => exec.id), // Yalnız id-ləri göndəririk
      notes: updateData.notes.map((note) => ({
        id: note.id,
        content: note.content,
        month: parseInt(note.month) || 0,
        year: parseInt(note.year) || 0,
      })),
    };

    try {
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
      console.error('PUT xətası:', error);
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="update-dialog-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="update-dialog-title">Tədbiri Yenilə</DialogTitle>
      <DialogContent>
        {updateData ? (
          <form>
            <FormField
              label="ID"
              value={updateData.id}
              readOnly
            />
            <FormField
              label="Başlıq"
              value={updateData.title}
              onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
              multiline={false}
            />
            <FormField
              label="Ad"
              value={updateData.name}
              onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
              multiline
              rows={3}
            />
            <FormField
              label="İcra Faizi"
              value={updateData.percentage}
              onChange={(e) => setUpdateData({ ...updateData, percentage: e.target.value })}
              type="number"
              inputProps={{ min: 1, max: 100, step: 1 }}
              multiline={false}
            />
            <FormField
              label="Başlama Tarixi"
              type="date"
              value={new Date(updateData.startDate).toISOString().slice(0, 10)}
              onChange={(e) => setUpdateData({ ...updateData, startDate: e.target.value })}
            />
            <FormField
              label="Bitmə Tarixi"
              type="date"
              value={new Date(updateData.endDate).toISOString().slice(0, 10)}
              onChange={(e) => setUpdateData({ ...updateData, endDate: e.target.value })}
            />

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              İcraçılar
            </Typography>
            {updateData.executors.map((executor) => (
              <Box key={executor.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormField
                  label="İcraçı"
                  value={executor.name}
                  readOnly
                  fullWidth={false}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveExecutor(executor.id)}
                  sx={{ ml: 1 }}
                >
                  İcraçı Sil
                </Button>
              </Box>
            ))}
            <FormControl fullWidth margin="normal">
              <InputLabel id="add-executor-label">Yeni İcraçı Əlavə Et</InputLabel>
              <Select
                labelId="add-executor-label"
                label="Yeni İcraçı Əlavə Et"
                onChange={(e) => handleAddExecutor(e.target.value)}
                value=""
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

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Qeydlər
            </Typography>
            {updateData.notes.map((note, index) => (
              <Box key={note.id} sx={{ mb: 2 }}>
                <FormField
                  label="Qeyd Məzmunu"
                  value={note.content}
                  onChange={(e) => handleNoteChange(index, 'content', e.target.value)}
                  multiline
                  rows={3}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id={`month-select-label-${index}`}>Ay</InputLabel>
                  <Select
                    labelId={`month-select-label-${index}`}
                    value={note.month}
                    onChange={(e) => handleNoteChange(index, 'month', e.target.value)}
                    label="Ay"
                  >
                    {months.map((month, i) => (
                      <MenuItem key={month} value={i + 1}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel id={`year-select-label-${index}`}>İl</InputLabel>
                  <Select
                    labelId={`year-select-label-${index}`}
                    value={note.year}
                    onChange={(e) => handleNoteChange(index, 'year', e.target.value)}
                    label="İl"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveNote(note.id)}
                  sx={{ mt: 1 }}
                >
                  Qeyd Sil
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleAddNote}
              sx={{ mt: 1 }}
            >
              Qeyd Əlavə Et
            </Button>
          </form>
        ) : (
          <DialogContentText>Yüklənir...</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Bağla
        </Button>
        <Button onClick={handleSave} color="primary">
          Saxla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateDataModal;