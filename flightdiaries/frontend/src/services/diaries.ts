import axios from 'axios';
import type {
  DiaryEntry,
  NewDiaryEntry,
  NonSensitiveDiaryEntry,
} from '../types';

const baseUrl = '/api/diaries';

const getBackendErrorMessage = (data: unknown): string | null => {
  if (data == null) {
    return null;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object') {
    if ('error' in data) {
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
            return JSON.stringify(issue);
          })
          .filter((m): m is string => Boolean(m));

        return messages.length ? messages.join(', ') : JSON.stringify(errorValue);
      }

      return JSON.stringify(errorValue);
    }

    return JSON.stringify(data);
  }

  return String(data);
};

const getAll = async (): Promise<NonSensitiveDiaryEntry[]> => {
  const response = await axios.get<NonSensitiveDiaryEntry[]>(baseUrl);
  return response.data;
};

const create = async (entry: NewDiaryEntry): Promise<DiaryEntry> => {
  try {
    const response = await axios.post<DiaryEntry>(baseUrl, entry);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const reason = getBackendErrorMessage(error.response?.data);
      throw new Error(reason ?? error.message, { cause: error });
    }
    throw new Error('Unknown error', { cause: error });
  }
};

export default {
  getAll,
  create,
};
