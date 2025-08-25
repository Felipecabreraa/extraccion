import React from 'react';
import { Box, Collapse, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useResponsive } from '../context/ResponsiveContext';

const ResponsiveFilters = ({ 
  children, 
  className = '', 
  sx = {},
  title = 'Filtros',
  defaultExpanded = true,
  showToggle = true,
  ...props 
}) => {
  const { isMobile } = useResponsive();
  const [expanded, setExpanded] = React.useState(!isMobile && defaultExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const responsiveSx = {
    display: 'flex',
    gap: isMobile ? 2 : 3,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 3,
    padding: isMobile ? 2 : 3,
    backgroundColor: 'white',
    borderRadius: 2,
    boxShadow: 1,
    ...sx
  };

  const mobileSx = {
    flexDirection: 'column',
    gap: 2,
    alignItems: 'stretch',
    '& .MuiFormControl-root': {
      width: '100%'
    }
  };

  if (isMobile && showToggle) {
    return (
      <Box 
        className={`filters-container ${isMobile ? 'filters-container-mobile' : ''} ${className}`}
        sx={{
          ...responsiveSx,
          ...mobileSx
        }}
        {...props}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <span style={{ fontWeight: 'bold' }}>{title}</span>
          </Box>
          <IconButton onClick={handleToggle} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            width: '100%'
          }}>
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box 
      className={`filters-container ${isMobile ? 'filters-container-mobile' : ''} ${className}`}
      sx={{
        ...responsiveSx,
        ...(isMobile && mobileSx)
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveFilters;

