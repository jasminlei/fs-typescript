import axios from 'axios';
import {
  type Entry,
  type NewEntry,
  type NonSensitivePatient,
  type Patient,
  type PatientFormValues,
} from '../types';

import { apiBaseUrl } from '../constants';

const getAll = async () => {
  const { data } = await axios.get<NonSensitivePatient[]>(
    `${apiBaseUrl}/patients`,
  );

  return data;
};

const getById = async (id: string) => {
  const { data } = await axios.get<Patient>(`${apiBaseUrl}/patients/${id}`);
  return data;
};

const create = async (object: PatientFormValues) => {
  const { data } = await axios.post<Patient>(`${apiBaseUrl}/patients`, object);

  return data;
};

const getBackendErrorMessage = (data: unknown): string | null => {
  if (data == null) {
    return null;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object' && 'error' in data) {
    const errorValue = (data as { error?: unknown }).error;
    if (typeof errorValue === 'string') {
      return errorValue;
    }
    if (Array.isArray(errorValue)) {
      const messages = errorValue
        .map((issue) => {
          if (issue && typeof issue === 'object' && 'message' in issue) {
            const message = (issue as { message?: unknown }).message;
            if (typeof message === 'string') {
              return message;
            }
          }
          return null;
        })
        .filter((m): m is string => Boolean(m));

      return messages.length ? messages.join(', ') : JSON.stringify(errorValue);
    }
    return JSON.stringify(errorValue);
  }

  return JSON.stringify(data);
};

const addEntry = async (patientId: string, entry: NewEntry): Promise<Entry> => {
  try {
    const { data } = await axios.post<Entry>(
      `${apiBaseUrl}/patients/${patientId}/entries`,
      entry,
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const reason = getBackendErrorMessage(error.response?.data);
      throw new Error(reason ?? error.message);
    }
    throw new Error('Unknown error');
  }
};

export default {
  getAll,
  getById,
  create,
  addEntry,
};
