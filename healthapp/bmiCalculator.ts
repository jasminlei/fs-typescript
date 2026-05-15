import { fileURLToPath } from 'url'

export const calculateBmi = (height: number, weight: number): string => {
  if (height <= 0 || weight <= 0) {
    throw new Error('Height and weight must be positive numbers')
  }

  const heightM = height / 100
  const bmi = weight / (heightM * heightM)

  if (bmi < 18.5) {
    return 'Underweight'
  }
  if (bmi < 25) {
    return 'Normal range'
  }
  if (bmi < 30) {
    return 'Overweight'
  }
  return 'Obese'
}

interface BmiValues {
  height: number
  weight: number
}

const parseQueryNumber = (value: unknown): number => {
  if (typeof value !== 'string') {
    throw new Error('malformatted parameters')
  }

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error('malformatted parameters')
  }

  return numberValue
}

export const parseBmiQuery = (query: unknown): BmiValues => {
  if (!query || typeof query !== 'object') {
    throw new Error('malformatted parameters')
  }

  const q = query as Record<string, unknown>
  return {
    height: parseQueryNumber(q.height),
    weight: parseQueryNumber(q.weight),
  }
}

const parseBmiArguments = (args: string[]): BmiValues => {
  if (args.length < 4) {
    throw new Error('not enough arguments')
  }
  if (args.length > 4) {
    throw new Error('too many arguments')
  }

  const height = Number(args[2])
  const weight = Number(args[3])

  if (!isNaN(height) && !isNaN(weight)) {
    return { height, weight }
  }

  throw new Error('values are not numbers')
}

const isMain = (() => {
  try {
    return process.argv[1] === fileURLToPath(import.meta.url)
  } catch {
    return false
  }
})()

if (isMain) {
  try {
    const { height, weight } = parseBmiArguments(process.argv)
    console.log(calculateBmi(height, weight))
  } catch (error: unknown) {
    let errorMessage = 'something unexpected happened.'
    if (error instanceof Error) {
      errorMessage += ' error: ' + error.message
    }
    console.log(errorMessage)
  }
}
