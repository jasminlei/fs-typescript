import { z } from 'zod';

import { Gender } from './types.ts';
import type { NewPatient } from './types.ts';

const genderValues = [Gender.Male, Gender.Female, Gender.Other] as const;

const newPatientSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().min(1),
  ssn: z.string().min(1),
  gender: z.enum(genderValues),
  occupation: z.string().min(1),
});

export const toNewPatient = (value: unknown): NewPatient => {
  return newPatientSchema.parse(value);
};
