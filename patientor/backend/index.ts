import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import diagnosisService from './services/diagnosisService.ts';
import type {
  Diagnosis,
  Entry,
  NonSensitivePatientData,
  Patient,
} from './types.ts';
import patientService from './services/patientService.ts';
import { toNewEntry, toNewPatient } from './utils.ts';

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

app.post('/api/patients', (req, res) => {
  try {
    const newPatient = toNewPatient(req.body);
    const addedPatient = patientService.addPatient(newPatient);
    res.json(addedPatient);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).send({ error: error.issues });
    } else {
      res.status(400).send({ error: 'unknown error' });
    }
  }
});

app.get('/api/patients/:id', (req: Request<{ id: string }>, res: Response) => {
  const patient = patientService.getPatient(req.params.id);

  if (!patient) {
    res.sendStatus(404);
    return;
  }

  res.json(patient satisfies Patient);
});

app.post(
  '/api/patients/:id/entries',
  (req: Request<{ id: string }>, res: Response<Entry | { error: unknown }>) => {
    try {
      const newEntry = toNewEntry(req.body);
      const addedEntry = patientService.addEntry(req.params.id, newEntry);

      if (!addedEntry) {
        res.sendStatus(404);
        return;
      }

      res.status(201).json(addedEntry);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        res.status(400).json({ error: 'unknown error' });
      }
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
