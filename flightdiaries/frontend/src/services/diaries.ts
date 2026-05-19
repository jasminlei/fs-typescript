import type { NonSensitiveDiaryEntry } from '../types';

const baseUrl = '/api/diaries';

const getAll = async (): Promise<NonSensitiveDiaryEntry[]> => {
  const response = await fetch(baseUrl);

  if (!response.ok) {
    throw new Error(
      `failed to fetch diaries: ${response.status} ${response.statusText}`,
    );
  }

  const data: NonSensitiveDiaryEntry[] = await response.json();
  return data;
};

export default {
  getAll,
};
