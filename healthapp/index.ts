import express from 'express';
import { calculateBmi, parseBmiQuery } from './bmiCalculator.ts';

const app = express();

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

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
