import type {
  Entry,
  NewEntry,
  Patient,
  NonSensitivePatientData,
  NewPatient,
} from '../types.ts';
import { v4 as uuid } from 'uuid';
import patientData from '../data/patients.ts';

const patients: Patient[] = patientData;

const getPatients = (): NonSensitivePatientData[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation,
  }));
};

const addPatient = (patient: NewPatient): Patient => {
  const id: string = uuid();
  const newPatient: Patient = {
    id,
    ...patient,
    entries: [],
  };

  patients.push(newPatient);
  return newPatient;
};

const getPatient = (id: string): Patient | undefined => {
  const patientToFind = patients.find((patient) => patient.id === id);
  return patientToFind;
};

const addEntry = (patientId: string, entry: NewEntry): Entry | undefined => {
  const patient = getPatient(patientId);
  if (!patient) {
    return undefined;
  }

  const newEntry: Entry = {
    id: uuid(),
    ...entry,
  };

  patient.entries.push(newEntry);
  return newEntry;
};

export default {
  getPatients,
  addPatient,
  getPatient,
  addEntry,
};
