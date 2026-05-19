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
  Visibility as VisibilityValues,
  Weather as WeatherValues,
} from './types';

const App = () => {
  const [diaries, setDiaries] = useState<NonSensitiveDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  const [date, setDate] = useState('');
  const [weather, setWeather] = useState<Weather>('sunny');
  const [visibility, setVisibility] = useState<Visibility>('great');
  const [comment, setComment] = useState('');

  const weatherOptions = Object.values(WeatherValues) as Weather[];
  const visibilityOptions = Object.values(VisibilityValues) as Visibility[];

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
      weather,
      visibility,
      comment: comment.trim() ? comment.trim() : undefined,
    };

    try {
      await diaryService.create(entry);
      await reloadDiaries();
      setDate('');
      setWeather('sunny');
      setVisibility('great');
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
            {weatherOptions.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="weather"
                  value={option}
                  checked={weather === option}
                  onChange={() => setWeather(option)}
                />
                {option}
              </label>
            ))}
          </div>
          <div>
            visibility
            {visibilityOptions.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="visibility"
                  value={option}
                  checked={visibility === option}
                  onChange={() => setVisibility(option)}
                />
                {option}
              </label>
            ))}
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
