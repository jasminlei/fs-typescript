import {
  type SubmitEventHandler,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import diaryService from './services/diaries';
import {
  type NewDiaryEntry,
  type NonSensitiveDiaryEntry,
  type Visibility,
  type Weather,
} from './types';

const App = () => {
  const [diaries, setDiaries] = useState<NonSensitiveDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  const [date, setDate] = useState('');
  const [weather, setWeather] = useState('');
  const [visibility, setVisibility] = useState('');
  const [comment, setComment] = useState('');

  const reloadDiaries = useCallback(async () => {
    const data = await diaryService.getAll();
    setDiaries(data);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await reloadDiaries();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error ? caught.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [reloadDiaries]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        window.clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const addDiary: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    const entry: NewDiaryEntry = {
      date,
      weather: weather as Weather,
      visibility: visibility as Visibility,
      comment: comment.trim() ? comment.trim() : undefined,
    };

    try {
      await diaryService.create(entry);
      await reloadDiaries();
      setDate('');
      setWeather('');
      setVisibility('');
      setComment('');
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : 'Unknown error';
      setError(message);

      if (errorTimeoutRef.current) {
        window.clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = window.setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <main>
      <h1>Flight diaries</h1>
      {loading ? <p>Loading…</p> : null}
      {error ? <p>Error: {error}</p> : null}

      <section>
        <h2>Add new entry</h2>
        <form onSubmit={addDiary}>
          <div>
            date
            <input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            weather
            <input
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
            />
          </div>
          <div>
            visibility
            <input
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            />
          </div>
          <div>
            comment
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button type='submit'>add</button>
        </form>
      </section>

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
