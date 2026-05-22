export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export const Gender = {
  Male: 'male',
  Female: 'female',
  Other: 'other',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export type Entry = unknown;

export interface NonSensitivePatient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  dateOfBirth: string;
}

export interface Patient extends NonSensitivePatient {
  ssn: string;
  entries: Entry[];
}

export type PatientFormValues = Omit<Patient, 'id' | 'entries'>;
