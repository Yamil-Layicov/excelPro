import React from 'react';
import { TextField } from '@mui/material';

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 1,
  error = false,
  helperText = '',
  fullWidth = true,
  margin = 'normal',
  size = 'small',
  variant = 'outlined',
  inputProps = {},
  InputLabelProps = {},
  InputProps = {},
}) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      multiline={multiline}
      rows={rows}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      margin={margin}
      size={size}
      variant={variant}
      inputProps={inputProps}
      InputLabelProps={{
        style: { fontSize: '0.9rem' },
        ...InputLabelProps,
      }}
      InputProps={{
        style: { fontSize: '0.9rem' },
        ...InputProps,
      }}
    />
  );
};

export default FormField;