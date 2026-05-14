interface Result {
  periodLength: number
  trainingDays: number
  success: boolean
  rating: 1 | 2 | 3
  ratingDescription: string
  target: number
  average: number
}

const calculateExercises = (hours: number[], target: number): Result => {
  if (target <= 0) {
    throw new Error('target must be a positive number')
  }

  if (hours.length === 0) {
    throw new Error('hours should not be empty')
  }

  if (hours.some((hours) => hours < 0)) {
    throw new Error('hours must be positive')
  }

  const periodLength = hours.length
  const trainingDays = hours.filter((hours) => hours > 0).length
  const totalHours = hours.reduce((sum, hours) => sum + hours, 0)
  const average = totalHours / periodLength

  const success = average >= target

  const ratio = average / target
  let rating: 1 | 2 | 3
  let ratingDescription: string

  if (ratio >= 1) {
    rating = 3
    ratingDescription = 'nice'
  } else if (ratio >= 0.75) {
    rating = 2
    ratingDescription = 'ok'
  } else {
    rating = 1
    ratingDescription = 'bad'
  }

  return {
    periodLength,
    trainingDays,
    success,
    rating,
    ratingDescription,
    target,
    average,
  }
}

console.log(calculateExercises([3, 0, 2, 4.5, 0, 3, 1], 2))
