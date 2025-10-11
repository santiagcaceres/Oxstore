import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: "admin" | "customer"
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  try {
    // In a real app, you would verify the JWT token here
    // For now, we'll simulate a user
    return {
      id: 1,
      email: "admin@oxstore.com",
      firstName: "Admin",
      lastName: "Oxstore",
      role: "admin",
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "admin") {
    redirect("/")
  }
  return user
}
