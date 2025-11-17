export interface GradeRecord {
  id: string
  courseCode: string
  courseName: string
  credits: number
  grade: string
  gpa: number
}

export interface GradePredictor {
  currentGpa: number
  totalCredits: number
  targetGpa: number
}

const MOCK_GRADES: GradeRecord[] = [
  { id: "1", courseCode: "MATH101", courseName: "Calculus I", credits: 4, grade: "A", gpa: 4.0 },
  { id: "2", courseCode: "PHYS102", courseName: "Physics II", credits: 4, grade: "A-", gpa: 3.7 },
  { id: "3", courseCode: "ENG101", courseName: "English Literature", credits: 3, grade: "B+", gpa: 3.3 },
  { id: "4", courseCode: "CHEM101", courseName: "Chemistry I", credits: 4, grade: "A", gpa: 4.0 },
  { id: "5", courseCode: "HIST101", courseName: "History of Science", credits: 3, grade: "A-", gpa: 3.7 },
]

export const getGrades = async (): Promise<GradeRecord[]> => {
  console.log("Using mock data for grades")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_GRADES)
    }, 500)
  })
}

export const predictGpa = async (predictor: GradePredictor): Promise<string> => {
  console.log("Predicting GPA (mock)", predictor)
  return new Promise((resolve) => {
    setTimeout(() => {
      const neededAverage =
        (predictor.targetGpa * (predictor.totalCredits + 12) - predictor.currentGpa * predictor.totalCredits) / 12
      resolve(
        `You need to achieve an average of ${neededAverage.toFixed(2)} in your next 12 credits to reach your target GPA of ${predictor.targetGpa}.`,
      )
    }, 500)
  })
}

export const analyzeGrades = async (rawData: string): Promise<void> => {
  console.log("Analyzing grades (mock)", rawData)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

/*
// Real API endpoints (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getGrades_real = async (): Promise<GradeRecord[]> => {
  const { data } = await axios.get(`${API_URL}/api/grades`)
  return data
}

export const predictGpa_real = async (predictor: GradePredictor): Promise<string> => {
  const { data } = await axios.post(`${API_URL}/api/grades/predict`, predictor)
  return data
}

export const analyzeGrades_real = async (rawData: string): Promise<void> => {
  await axios.post(`${API_URL}/api/grades/analysis`, { rawData })
}
*/
