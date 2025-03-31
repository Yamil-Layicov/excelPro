import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const DeleteDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Button onClick={onClose} color="primary">
          Xeyr
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Bəli
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;