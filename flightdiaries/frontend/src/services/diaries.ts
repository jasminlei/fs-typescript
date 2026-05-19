import type {
  DiaryEntry,
  NewDiaryEntry,
  NonSensitiveDiaryEntry,
} from '../types';

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

const create = async (entry: NewDiaryEntry): Promise<DiaryEntry> => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(
      `failed to create diary entry: ${response.status} ${response.statusText}`,
    );
  }

  const data: DiaryEntry = await response.json();
  return data;
};

export default {
  getAll,
  create,
};
