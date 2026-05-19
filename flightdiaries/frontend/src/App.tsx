import { useEffect, useState } from 'react';
import diaryService from './services/diaries';
import type { NonSensitiveDiaryEntry } from './types';

const App = () => {
  const [diaries, setDiaries] = useState<NonSensitiveDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const data = await diaryService.getAll();
        setDiaries(data);
      } catch (caught: unknown) {
        const message =
          caught instanceof Error ? caught.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchDiaries();
  }, []);

  return (
    <main>
      <h1>Flight diaries</h1>
      {loading ? <p>Loading…</p> : null}
      {error ? <p>Error: {error}</p> : null}

      <ul>
        {diaries.map((diary) => (
          <li key={diary.id}>
            <strong>{diary.date}</strong>
            <div>visibility: {diary.visibility}</div>
            <div>weather: {diary.weather}</div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default App;
