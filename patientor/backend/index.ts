import express, { type Response } from 'express';
import cors from 'cors';
import diagnosisService from './services/diagnosisService.ts';
import type {
  Diagnosis,
  NewPatient,
  NonSensitivePatientData,
  Patient,
} from './types';
import patientService from './services/patientService.ts';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.use(express.json());

const PORT = 3001;

app.get('/api/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.get('/api/diagnoses', (_req, res: Response<Diagnosis[]>) => {
  res.send(diagnosisService.getDiagnoses());
});

app.get('/api/patients', (_req, res: Response<NonSensitivePatientData[]>) => {
  res.send(patientService.getPatients());
});

app.post('/api/patients', (req, res: Response<Patient | { error: string }>) => {
  try {
    const newPatient = req.body as NewPatient;
    const addedPatient = patientService.addPatient(newPatient);
    res.json(addedPatient);
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}`;
    }

    res.status(400).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
