import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const RouterWrapper = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {children}
    </BrowserRouter>
  );
};

export default RouterWrapper; 