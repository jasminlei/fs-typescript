import type { Patient, NonSensitivePatientData } from '../types';
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

export default {
  getPatients,
};
