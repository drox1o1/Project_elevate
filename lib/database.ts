// Database utility functions
// This is a generic implementation that can be adapted to your specific database

export interface WaitlistUser {
  id?: string
  name: string
  age: number
  mobile: string
  email: string
  createdAt?: Date
}

// Simple JSON based storage for waitlist
import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_PATH = join(process.cwd(), 'data')
const FILE_PATH = join(DATA_PATH, 'waitlist.json')

// Ensure data directory exists
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true })
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '[]')
  }
}

// Save waitlist user to local JSON file
export async function saveWaitlistUser(
  userData: Omit<WaitlistUser, "id" | "createdAt">,
): Promise<{ success: boolean; message: string }> {
  try {
    await ensureDataFile()
    const raw = await fs.readFile(FILE_PATH, 'utf8')
    const existing: WaitlistUser[] = JSON.parse(raw)

    const newUser: WaitlistUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    existing.push(newUser)
    await fs.writeFile(FILE_PATH, JSON.stringify(existing, null, 2))

    return {
      success: true,
      message: 'User successfully added to waitlist',
    }
  } catch (error) {
    console.error('Error saving user to waitlist:', error)
    return {
      success: false,
      message: 'Failed to save user data',
    }
  }
}
