import type { Patient, NonSensitivePatientData, NewPatient } from '../types.ts';
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
  };

  patients.push(newPatient);
  return newPatient;
};

export default {
  getPatients,
  addPatient,
};
