import express from 'express';
import { calculateBmi, parseBmiQuery } from './bmiCalculator.ts';
import { calculateExercises, parseExercisesBody } from './exerciseCalculator.ts';

const app = express();

app.use(express.json());

app.get('/hello', (_req, res) => {
  res.send('Hello Full Stack!');
});

app.get('/bmi', (req, res) => {
  try {
    const { height, weight } = parseBmiQuery(req.query);
    return res.json({
      weight,
      height,
      bmi: calculateBmi(height, weight),
    });
  } catch {
    return res.status(400).json({ error: 'malformatted parameters' });
  }
});

app.post('/exercises', (req, res) => {
  try {
    const { target, dailyExercises } = parseExercisesBody(req.body);
    return res.json(calculateExercises(dailyExercises, target));
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'parameters missing') {
      return res.status(400).json({ error: 'parameters missing' });
    }

    return res.status(400).json({ error: 'malformatted parameters' });
  }
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
