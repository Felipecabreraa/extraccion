import React from 'react';
import { Paper, Box } from '@mui/material';
import { useResponsive } from '../context/ResponsiveContext';

const ResponsiveCard = ({ 
  children, 
  className = '', 
  sx = {}, 
  padding = 3,
  mobilePadding = 2,
  minHeight = 200,
  mobileMinHeight = 150,
  elevation = 1,
  ...props 
}) => {
  const { isMobile } = useResponsive();

  const responsiveSx = {
    padding: isMobile ? mobilePadding : padding,
    minHeight: isMobile ? mobileMinHeight : minHeight,
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    ...sx
  };

  return (
    <Paper 
      className={`responsive-card ${isMobile ? 'responsive-card-mobile' : ''} ${className}`}
      elevation={elevation}
      sx={responsiveSx}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default ResponsiveCard;

