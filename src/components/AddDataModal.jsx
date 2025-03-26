import { useState } from 'react';
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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '80vh', // Modalın maksimum hündürlüyü ekranın 80%-i
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto', // Yuxarı-aşağı scroll
};

function AddDataModal({ open, onClose, onAddData }) {
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

  const [formData, setFormData] = useState({
    id: '',
    event: '',
    executors: '',
    startDate: '',
    endDate: '',
    progress: '',
    status: {},
  });
  const [selectedStatusMonths, setSelectedStatusMonths] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('status.')) {
      const month = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        status: { ...prev.status, [month]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMonthChange = (event) => {
    const value = event.target.value;
    const newSelection = typeof value === 'string' ? value.split(',') : value;
    setSelectedStatusMonths(newSelection);
    setFormData((prev) => {
      const newStatus = {};
      newSelection.forEach((month) => {
        newStatus[month] = prev.status[month] || '';
      });
      return { ...prev, status: newStatus };
    });
  };

  const handleSubmit = () => {
    const newData = {
      ...formData,
      progress: parseFloat(formData.progress) || 0,
    };
    onAddData(newData);
    setFormData({
      id: '',
      event: '',
      executors: '',
      startDate: '',
      endDate: '',
      progress: '',
      status: {},
    });
    setSelectedStatusMonths([]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Yeni Data Əlavə Et
        </Typography>
        <TextField
          label="ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tədbir"
          name="event"
          value={formData.event}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="İcraçılar"
          name="executors"
          value={formData.executors}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Başlama Tarixi (YYYY-MM-DD)"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bitmə Tarixi (YYYY-MM-DD)"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="İcra Faizi (0-1 arası)"
          name="progress"
          value={formData.progress}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="number"
          inputProps={{ min: 0, max: 1, step: 0.01 }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-month-select-label">Status Ayları</InputLabel>
          <Select
            labelId="status-month-select-label"
            multiple
            value={selectedStatusMonths}
            onChange={handleMonthChange}
            renderValue={(selected) => selected.join(', ')}
            label="Status Ayları"
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                <Checkbox checked={selectedStatusMonths.indexOf(month) > -1} />
                <ListItemText primary={month} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedStatusMonths.map((month) => (
          <TextField
            key={month}
            label={`${month} Statusu`}
            name={`status.${month}`}
            value={formData.status[month] || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        ))}
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
          Əlavə Et
        </Button>
      </Box>
    </Modal>
  );
}

export default AddDataModal;