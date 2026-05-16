import { fileURLToPath } from 'url';

interface Result {
  periodLength: number
  trainingDays: number
  success: boolean
  rating: 1 | 2 | 3
  ratingDescription: string
  target: number
  average: number
}

export const calculateExercises = (hours: number[], target: number): Result => {
  if (target <= 0) {
    throw new Error('target must be a positive number');
  }

  if (hours.length === 0) {
    throw new Error('hours should not be empty');
  }

  if (hours.some((hours) => hours < 0)) {
    throw new Error('hours must be positive');
  }

  const periodLength = hours.length;
  const trainingDays = hours.filter((hours) => hours > 0).length;
  const totalHours = hours.reduce((sum, hours) => sum + hours, 0);
  const average = totalHours / periodLength;

  const success = average >= target;

  const ratio = average / target;
  let rating: 1 | 2 | 3;
  let ratingDescription: string;

  if (ratio >= 1) {
    rating = 3;
    ratingDescription = 'nice';
  } else if (ratio >= 0.75) {
    rating = 2;
    ratingDescription = 'ok';
  } else {
    rating = 1;
    ratingDescription = 'bad';
  }

  return {
    periodLength,
    trainingDays,
    success,
    rating,
    ratingDescription,
    target,
    average,
  };
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toNumber = (value: unknown): number => {
  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error('malformatted parameters');
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error('malformatted parameters');
  }

  return numberValue;
};

export const parseExercisesBody = (
  body: unknown,
): { target: number; dailyExercises: number[] } => {
  if (!isObject(body)) {
    throw new Error('malformatted parameters');
  }

  if (!('daily_exercises' in body) || !('target' in body)) {
    throw new Error('parameters missing');
  }

  const dailyExercisesUnknown = body.daily_exercises;
  const targetUnknown = body.target;

  if (!Array.isArray(dailyExercisesUnknown)) {
    throw new Error('malformatted parameters');
  }

  const dailyExercises = dailyExercisesUnknown.map((v) => toNumber(v));
  const target = toNumber(targetUnknown);

  return { target, dailyExercises };
};

interface ExerciseValues {
  target: number
  hours: number[]
}

const parseExerciseArguments = (args: string[]): ExerciseValues => {
  if (args.length < 4) {
    throw new Error('not enough arguments');
  }

  const target = Number(args[2]);
  const hours = args.slice(3).map((a) => Number(a));

  if (isNaN(target) || hours.some((h) => isNaN(h))) {
    throw new Error('values were not numbers');
  }

  return {
    target,
    hours,
  };
};

const isMain = (() => {
  try {
    return process.argv[1] === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isMain) {
  try {
    const { target, hours } = parseExerciseArguments(process.argv);
    console.log(calculateExercises(hours, target));
  } catch (error: unknown) {
    let errorMessage = 'something unexpected happened';
    if (error instanceof Error) {
      errorMessage += ' error: ' + error.message;
    }
    console.log(errorMessage);
  }
}
