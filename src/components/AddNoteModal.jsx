import { useState } from 'react';
import {
  Modal,
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import toast from 'react-hot-toast';
import FormField from './FormField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  boxShadow: 24,
  p: 3,
};

function AddNoteModal({ open, onClose, eventId, onAddNote }) {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const [noteData, setNoteData] = useState({
    content: '',
    month: '',
    year: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNoteData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!noteData.content) errors.content = 'Məzmun boş ola bilməz';
    if (!noteData.month) errors.month = 'Ay seçilməlidir';
    if (!noteData.year) errors.year = 'İl seçilməlidir';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Autentifikasiya tokeni tapılmadı');
      return;
    }
  
    if (!validateForm()) {
      toast.error('Zəhmət olmasa bütün sahələri doldurun');
      return;
    }
  
    const payload = {
      strategyEventId: eventId,
      content: noteData.content,
      month: parseInt(noteData.month),
      year: parseInt(noteData.year),
    };
  
    try {
      const response = await fetch('http://192.168.100.123:5051/api/Notes/Add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const newNote = await response.json();
        console.log("API-dan gələn yeni qeyd:", newNote);
        // API cavabının strukturuna uyğun olaraq düzəliş edirik
        onAddNote(newNote.data || newNote); // Əgər newNote.data varsa, onu ötürürük, yoxsa birbaşa newNote
        toast.success('Qeyd uğurla əlavə olundu');
        setNoteData({ content: '', month: '', year: '' });
        setFormErrors({});
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Qeyd əlavə olunmadı');
      }
    } catch (error) {
      console.error('POST xətası:', error);
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Yeni Qeyd Əlavə Et
        </Typography>
        <FormField
          label="Məzmun"
          name="content"
          value={noteData.content}
          onChange={handleChange}
          multiline
          rows={3}
          error={!!formErrors.content}
          helperText={formErrors.content}
        />
        <FormControl fullWidth margin="normal" error={!!formErrors.month}>
          <InputLabel id="month-select-label">Ay</InputLabel>
          <Select
            labelId="month-select-label"
            name="month"
            value={noteData.month}
            onChange={handleChange}
            label="Ay"
          >
            {months.map((month, i) => (
              <MenuItem key={month} value={i + 1}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!formErrors.year}>
          <InputLabel id="year-select-label">İl</InputLabel>
          <Select
            labelId="year-select-label"
            name="year"
            value={noteData.year}
            onChange={handleChange}
            label="İl"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#115293' },
            }}
          >
            Əlavə Et
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddNoteModal;