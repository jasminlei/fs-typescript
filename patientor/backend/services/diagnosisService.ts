import type { Diagnosis } from '../types.ts';
import diagnosisData from '../data/diagnoses.ts';

const diagnoses: Diagnosis[] = diagnosisData;

const getDiagnoses = (): Diagnosis[] => {
  return diagnoses;
};

export default {
  getDiagnoses,
};
