import { Gender as GenderValues } from './types.ts';
import type { Gender, NewPatient } from './types.ts';

const isString = (value: unknown): value is string => {
  return typeof value === 'string' || value instanceof String;
};

const parseString = (value: unknown, fieldName: string): string => {
  if (!isString(value)) {
    throw new Error(`Incorrect or missing ${fieldName}`);
  }

  return value;
};

const isGender = (value: unknown): value is Gender => {
  return (
    isString(value) && (Object.values(GenderValues) as string[]).includes(value)
  );
};

const parseGender = (value: unknown): Gender => {
  if (!isGender(value)) {
    throw new Error('Incorrect or missing gender');
  }

  return value;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const toNewPatient = (value: unknown): NewPatient => {
  if (!isObject(value)) {
    throw new Error('Incorrect or missing patient data');
  }

  return {
    name: parseString(value.name, 'name'),
    dateOfBirth: parseString(value.dateOfBirth, 'dateOfBirth'),
    ssn: parseString(value.ssn, 'ssn'),
    gender: parseGender(value.gender),
    occupation: parseString(value.occupation, 'occupation'),
  };
};
