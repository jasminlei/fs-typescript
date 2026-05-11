const calculateBmi = (height: number, weight: number): string => {
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

console.log(calculateBmi(169, 54))
