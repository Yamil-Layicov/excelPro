import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Fade,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import FormField from './FormField';
import { styled } from '@mui/system';

// Custom styled components
const StyledModalBox = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  maxHeight: '85vh',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  padding: '24px',
  overflowY: 'auto',
  border: '1px solid #e0e0e0',
});

const StyledButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: '#fff',
  padding: '8px 16px',
  fontWeight: '500',
  textTransform: 'none',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#115293',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
  },
});

const AddNoteButton = styled(Button)({
  borderColor: '#388e3c',
  color: '#388e3c',
  padding: '6px 12px',
  fontSize: '0.85rem',
  textTransform: 'none',
  borderRadius: '6px',
  '&:hover': {
    borderColor: '#2e7d32',
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
});

const DeleteNoteButton = styled(Button)({
  borderColor: '#d32f2f',
  color: '#d32f2f',
  padding: '4px 10px',
  fontSize: '0.8rem',
  textTransform: 'none',
  borderRadius: '6px',
  '&:hover': {
    borderColor: '#b71c1c',
    color: '#b71c1c',
    backgroundColor: '#ffebee',
  },
});

const StyledFormControl = styled(FormControl)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#bdbdbd',
    },
    '&:hover fieldset': {
      borderColor: '#757575',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#616161',
    fontSize: '0.9rem',
  },
});

function AddDataModal({ open, onClose, onAddData }) {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i); // 2020 to 2030

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    percentage: '',
    startDate: '',
    endDate: '',
    executorIds: [],
    notes: [{ content: '', month: '', year: '' }],
  });
  const [executors, setExecutors] = useState([]);
  const [error, setError] = useState(null);
  const [percentageError, setPercentageError] = useState('');

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Autentifikasiya tokeni tapılmadı');
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
          if (!response.ok) throw new Error(`HTTP xətası! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          setExecutors(data.data || []);
          setError(null);
        })
        .catch((error) => {
          console.error('Icraçıları çəkməkdə xəta:', error);
          setError('Icraçıları çəkmək mümkün olmadı');
          setExecutors([]);
        });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'percentage') {
      const numValue = value === '' ? '' : parseFloat(value);
      if (numValue === '' || (numValue >= 1 && numValue <= 100)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setPercentageError('');
      } else {
        setPercentageError('Faiz 1 ilə 100 arasında olmalıdır');
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleExecutorChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, executorIds: value }));
  };

  const handleNoteChange = (index, field, value) => {
    setFormData((prev) => {
      const newNotes = [...prev.notes];
      newNotes[index] = { ...newNotes[index], [field]: value };
      return { ...prev, notes: newNotes };
    });
  };

  const addNote = () => {
    setFormData((prev) => ({
      ...prev,
      notes: [...prev.notes, { content: '', month: '', year: '' }],
    }));
  };

  const removeNote = (index) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Autentifikasiya tokeni tapılmadı');
      return;
    }
    if (percentageError) {
      toast.error('Faiz sahəsində xəta var');
      return;
    }

    const payload = {
      ...formData,
      percentage: formData.percentage.toString(),
      notes: formData.notes.map((note) => ({
        content: note.content,
        month: parseInt(note.month) || 0,
        year: parseInt(note.year) || 0,
      })),
    };

    try {
      const response = await fetch('http://192.168.100.123:5051/api/StrategyEvents/Add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newData = await response.json();
        onAddData(newData);
        toast.success('Məlumat uğurla əlavə olundu');
        setFormData({
          title: '',
          name: '',
          percentage: '',
          startDate: '',
          endDate: '',
          executorIds: [],
          notes: [{ content: '', month: '', year: '' }],
        });
        setPercentageError('');
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Məlumat əlavə olunmadı');
      }
    } catch (error) {
      console.error('POST xətası:', error);
      toast.error('Xəta baş verdi, yenidən cəhd edin');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Fade in={open}>
        <StyledModalBox>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: '600', color: '#1976d2', mb: 3 }}
          >
            Strategiya üzrə tədbirlər
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormField
              label="Nömrə"
              name="title"
              value={formData.title}
              onChange={handleChange}
              rows={3}
            />
            <FormField
              label="Strategiya üzrə tədbirlər"
              name="name"
              value={formData.name}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <FormField
              label="Faiz"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              type="number"
              error={!!percentageError}
              helperText={percentageError}
              inputProps={{ min: 1, max: 100, step: 1 }}
            />
            <FormField
              label="Başlama Tarixi"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <FormField
              label="Bitmə Tarixi"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <StyledFormControl fullWidth>
              <InputLabel id="executors-select-label">İcraçılar</InputLabel>
              <Select
                labelId="executors-select-label"
                multiple
                name="executorIds"
                value={formData.executorIds}
                onChange={handleExecutorChange}
                label="İcraçılar"
                disabled={!!error}
                renderValue={(selected) =>
                  selected
                    .map((id) => executors.find((e) => e.id === id)?.name || id)
                    .join(', ')
                }
              >
                {executors.map((executor) => (
                  <MenuItem key={executor.id} value={executor.id}>
                    <Checkbox
                      checked={formData.executorIds.indexOf(executor.id) > -1}
                      icon={<Box sx={{ width: 20, height: 20, border: '1px solid grey' }} />}
                      checkedIcon={<CheckIcon sx={{ fontSize: 20, color: '#1976d2' }} />}
                    />
                    <ListItemText primary={executor.name} />
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: '500', color: '#424242' }}>
              Qeydlər
            </Typography>
            {formData.notes.map((note, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  mb: 2,
                  backgroundColor: '#fafafa',
                }}
              >
                <FormField
                  label="Məzmun"
                  value={note.content}
                  onChange={(e) => handleNoteChange(index, 'content', e.target.value)}
                  multiline
                  rows={3}
                />
                <StyledFormControl fullWidth sx={{ mt: 2 }}>
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
                </StyledFormControl>
                <StyledFormControl fullWidth sx={{ mt: 2 }}>
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
                </StyledFormControl>
                {formData.notes.length > 1 && (
                  <DeleteNoteButton
                    variant="outlined"
                    onClick={() => removeNote(index)}
                    startIcon={<DeleteIcon />}
                    sx={{ mt: 2 }}
                  >
                    Sil
                  </DeleteNoteButton>
                )}
              </Box>
            ))}
            <AddNoteButton
              variant="outlined"
              onClick={addNote}
              startIcon={<AddIcon />}
            >
              Yeni Qeyd Əlavə Et
            </AddNoteButton>

            <StyledButton
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{ mt: 3 }}
            >
              Əlavə Et
            </StyledButton>
          </Box>
        </StyledModalBox>
      </Fade>
    </Modal>
  );
}

export default AddDataModal;