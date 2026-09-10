// Grading configuration and utilities

export const GRADING_SCALE = [
  { minPercentage: 90, grade: 'A+', points: 10.0 },
  { minPercentage: 80, grade: 'A', points: 9.0 },
  { minPercentage: 70, grade: 'B', points: 8.0 },
  { minPercentage: 60, grade: 'C', points: 7.0 },
  { minPercentage: 50, grade: 'D', points: 6.0 },
  { minPercentage: 0, grade: 'F', points: 0.0 }
]

export function computeGrade(marksObtained: number, maxMarks: number): string {
  if (maxMarks <= 0) return 'F'
  const percentage = (marksObtained / maxMarks) * 100

  for (const scale of GRADING_SCALE) {
    if (percentage >= scale.minPercentage) {
      return scale.grade
    }
  }
  return 'F'
}

export function computeGradePoints(grade: string): number {
  const scale = GRADING_SCALE.find(s => s.grade === grade)
  return scale ? scale.points : 0.0
}

export function calculateCGPA(publishedResults: any[]): number {
  if (!publishedResults || publishedResults.length === 0) return 0.0

  let totalPoints = 0
  let totalCredits = 0

  for (const result of publishedResults) {
    // Assuming result object shape includes: { grade: string, exam: { course: { credits: number } } }
    const credits = result.exam?.course?.credits || 0
    if (credits > 0) {
      const points = computeGradePoints(result.grade)
      totalPoints += points * credits
      totalCredits += credits
    }
  }

  if (totalCredits === 0) return 0.0

  return Number((totalPoints / totalCredits).toFixed(2))
}
