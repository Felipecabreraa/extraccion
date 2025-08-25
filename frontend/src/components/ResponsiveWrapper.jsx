import React from 'react';
import { Box } from '@mui/material';
import { useResponsive } from '../context/ResponsiveContext';

const ResponsiveWrapper = ({ 
  children, 
  className = '', 
  sx = {}, 
  gridColumns = 1,
  gap = 2,
  padding = 2,
  mobilePadding = 1,
  ...props 
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridTemplateColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) {
      return gridColumns >= 3 ? 'repeat(2, 1fr)' : `repeat(${gridColumns}, 1fr)`;
    }
    return `repeat(${gridColumns}, 1fr)`;
  };

  const responsiveSx = {
    display: 'grid',
    gap: isMobile ? gap * 0.5 : gap,
    gridTemplateColumns: getGridTemplateColumns(),
    padding: isMobile ? mobilePadding : padding,
    width: '100%',
    ...sx
  };

  return (
    <Box 
      className={`responsive-wrapper ${className}`}
      sx={responsiveSx}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveWrapper;

