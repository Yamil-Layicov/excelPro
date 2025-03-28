import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import toast from 'react-hot-toast';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  boxShadow: 24,
  p: 3,
  overflowY: 'auto',
};

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
  const [percentageError, setPercentageError] = useState(''); // For percentage validation feedback

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
          if (!response.ok) {
            throw new Error(`HTTP xətası! Status: ${response.status}`);
          }
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
      // Validate percentage
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
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '1.2rem' }}>
          Strategiya üzrə tədbirlər
        </Typography>
        <TextField
          label="Nömrə"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          multiline
          rows={3}
          variant="outlined"
          InputLabelProps={{ style: { fontSize: '0.9rem' } }}
          InputProps={{ style: { fontSize: '0.9rem' } }}
        />
        <TextField
          label="Strategiya üzrə tədbirlər"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          multiline
          rows={3}
          variant="outlined"
          InputLabelProps={{ style: { fontSize: '0.9rem' } }}
          InputProps={{ style: { fontSize: '0.9rem' } }}
        />
        <TextField
          label="Faiz"
          name="percentage"
          value={formData.percentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="number"
          size="small"
          variant="outlined"
          error={!!percentageError}
          helperText={percentageError}
          InputLabelProps={{ style: { fontSize: '0.9rem' } }}
          InputProps={{ 
            style: { fontSize: '0.9rem' },
            inputProps: { min: 1, max: 100, step: 1 } // Browser-level restriction
          }}
        />
        <TextField
          label="Başlama Tarixi"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="datetime-local"
          size="small"
          variant="outlined"
          InputLabelProps={{ style: { fontSize: '0.9rem' }, shrink: true }}
          InputProps={{ style: { fontSize: '0.9rem' } }}
        />
        <TextField
          label="Bitmə Tarixi"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="datetime-local"
          size="small"
          variant="outlined"
          InputLabelProps={{ style: { fontSize: '0.9rem' }, shrink: true }}
          InputProps={{ style: { fontSize: '0.9rem' } }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel
            id="executors-select-label"
            sx={{ fontSize: '0.9rem', top: '-6px' }}
          >
            İcraçılar
          </InputLabel>
          <Select
            labelId="executors-select-label"
            multiple
            name="executorIds"
            value={formData.executorIds}
            onChange={handleExecutorChange}
            label="İcraçılar"
            disabled={!!error}
            size="small"
            sx={{ fontSize: '0.9rem' }}
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
                  checkedIcon={<CheckIcon sx={{ fontSize: 20 }} />}
                />
                <ListItemText
                  primary={executor.name}
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
            {error}
          </Typography>
        )}
        <Typography variant="subtitle1" sx={{ mt: 2, fontSize: '1rem' }}>
          Qeydlər
        </Typography>
        {formData.notes.map((note, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <TextField
              label="Məzmun"
              value={note.content}
              onChange={(e) => handleNoteChange(index, 'content', e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              multiline
              rows={3}
              variant="outlined"
              InputLabelProps={{ style: { fontSize: '0.9rem' } }}
              InputProps={{ style: { fontSize: '0.9rem' } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel
                id={`month-select-label-${index}`}
                sx={{ fontSize: '0.9rem', top: '-6px' }}
              >
                Ay
              </InputLabel>
              <Select
                labelId={`month-select-label-${index}`}
                value={note.month}
                onChange={(e) => handleNoteChange(index, 'month', e.target.value)}
                label="Ay"
                size="small"
                sx={{ fontSize: '0.9rem' }}
              >
                {months.map((month, i) => (
                  <MenuItem key={month} value={i + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel
                id={`year-select-label-${index}`}
                sx={{ fontSize: '0.9rem', top: '-6px' }}
              >
                İl
              </InputLabel>
              <Select
                labelId={`year-select-label-${index}`}
                value={note.year}
                onChange={(e) => handleNoteChange(index, 'year', e.target.value)}
                label="İl"
                size="small"
                sx={{ fontSize: '0.9rem' }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.notes.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeNote(index)}
                size="small"
                sx={{ mt: 1, fontSize: '0.8rem' }}
              >
                Sil
              </Button>
            )}
          </Box>
        ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            mt: 2,
            mb: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={addNote}
            size="small"
            sx={{
              fontSize: '0.8rem',
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#115293',
                color: '#115293',
                bgcolor: '#e3f2fd',
              },
            }}
          >
            Yeni Qeyd Əlavə Et
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              fontSize: '0.9rem',
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

export default AddDataModal;