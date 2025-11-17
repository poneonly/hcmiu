export interface LoginRequest {
  studentId: string
  password: string
}

export interface User {
  id: string
  studentId: string
  name: string
  email: string
  gpa: number
}

// Mock data
const MOCK_USER: User = {
  id: "1",
  studentId: "STU001",
  name: "Alex Johnson",
  email: "alex@university.edu",
  gpa: 3.75,
}

// Mock login function
export const loginUser = async (credentials: LoginRequest): Promise<User> => {
  console.log("Using mock data for login")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USER)
    }, 500)
  })
}

// Mock get current user
export const getCurrentUser = async (): Promise<User> => {
  console.log("Using mock data for current user")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USER)
    }, 300)
  })
}

/*
// Real API endpoints (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const loginUser_real = async (credentials: LoginRequest): Promise<User> => {
  const { data } = await axios.post(`${API_URL}/api/auth/login`, credentials)
  return data
}

export const getCurrentUser_real = async (): Promise<User> => {
  const { data } = await axios.get(`${API_URL}/api/auth/me`)
  return data
}
*/
