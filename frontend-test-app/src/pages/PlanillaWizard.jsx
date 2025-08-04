import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import PlanillaBarredores from './PlanillaBarredores';
import PlanillaMaquinas from './PlanillaMaquinas';
import PlanillaPabellones from './PlanillaPabellones';
import PlanillaDanos from './PlanillaDanos';

const steps = ['Barredores', 'Máquinas', 'Pabellones', 'Daños'];

export default function PlanillaWizard({ planillaId, onFinish }) {
  const [activeStep, setActiveStep] = useState(0);

  // Callbacks para avanzar automáticamente
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Paper sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === 0 && (
          <PlanillaBarredores planillaId={planillaId} onComplete={handleNext} />
        )}
        {activeStep === 1 && (
          <PlanillaMaquinas planillaId={planillaId} onComplete={handleNext} />
        )}
        {activeStep === 2 && (
          <PlanillaPabellones planillaId={planillaId} onComplete={handleNext} />
        )}
        {activeStep === 3 && (
          <PlanillaDanos planillaId={planillaId} onComplete={onFinish} />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Atrás</Button>
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} variant="contained">Siguiente</Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button onClick={onFinish} variant="contained" color="success">Finalizar</Button>
        )}
      </Box>
    </Paper>
  );
} 