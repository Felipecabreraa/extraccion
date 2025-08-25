import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  Typography
} from '@mui/material';
import { useResponsive } from '../context/ResponsiveContext';

const ResponsiveTable = ({ 
  data, 
  columns, 
  className = '', 
  sx = {},
  emptyMessage = 'No hay datos disponibles',
  minWidth = 600,
  mobileMinWidth = 500,
  ...props 
}) => {
  const { isMobile } = useResponsive();

  const responsiveSx = {
    minWidth: isMobile ? mobileMinWidth : minWidth,
    ...sx
  };

  const cellSx = {
    padding: isMobile ? 1 : 1.5,
    fontSize: isMobile ? '0.875rem' : '1rem',
    whiteSpace: 'nowrap'
  };

  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          padding: 3,
          color: 'text.secondary'
        }}
      >
        <Typography variant="body1">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      className="responsive-table-container"
      sx={{
        overflowX: 'auto',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Table 
        className={`responsive-table ${isMobile ? 'responsive-table-mobile' : ''} ${className}`}
        sx={responsiveSx}
        {...props}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell 
                key={column.id} 
                sx={{
                  ...cellSx,
                  fontWeight: 'bold',
                  backgroundColor: 'grey.50'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} hover>
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  sx={cellSx}
                >
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ResponsiveTable;

