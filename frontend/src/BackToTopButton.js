import React from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fab, Zoom } from '@mui/material';

export default function BackToTopButton({ show, onClick }) {
  return (
    <Zoom in={show}>
      <Fab
        color="primary"
        size="medium"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1200,
          boxShadow: 3,
        }}
        aria-label="Back to Top"
      >
        <KeyboardArrowUpIcon fontSize="large" />
      </Fab>
    </Zoom>
  );
}
