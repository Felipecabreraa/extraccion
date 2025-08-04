import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const RouterWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

export default RouterWrapper; 