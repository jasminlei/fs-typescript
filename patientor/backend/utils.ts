import { z } from 'zod';

import { Gender } from './types.ts';
import type { NewEntry, NewPatient } from './types.ts';

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

const diagnosisCodesSchema = z.array(z.string().min(1)).optional();

const entryBaseSchema = z.object({
  date: z.string().min(1),
  specialist: z.string().min(1),
  description: z.string().min(1),
  diagnosisCodes: diagnosisCodesSchema,
});

const hospitalEntrySchema = entryBaseSchema.extend({
  type: z.literal('Hospital'),
  discharge: z.object({
    date: z.string().min(1),
    criteria: z.string().min(1),
  }),
});

const occupationalHealthcareEntrySchema = entryBaseSchema.extend({
  type: z.literal('OccupationalHealthcare'),
  employerName: z.string().min(1),
  sickLeave: z
    .object({
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    })
    .optional(),
});

const healthCheckEntrySchema = entryBaseSchema.extend({
  type: z.literal('HealthCheck'),
  healthCheckRating: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
});

const newEntrySchema = z.discriminatedUnion('type', [
  hospitalEntrySchema,
  occupationalHealthcareEntrySchema,
  healthCheckEntrySchema,
]);

export const toNewEntry = (value: unknown): NewEntry => {
  return newEntrySchema.parse(value);
};
