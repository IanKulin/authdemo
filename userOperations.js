import fs from "fs/promises"
import bcrypt from "bcrypt"

const USER_FILE = ".users"

export async function getUsers() {
  try {
    const data = await fs.readFile(USER_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return an empty array
      return []
    }
    throw error
  }
}

export async function saveUsers(users) {
  await fs.writeFile(USER_FILE, JSON.stringify(users, null, 2))
}

export async function findUser(username) {
  const users = await getUsers()
  return users.find((user) => user.username === username)
}

export async function addUser(username, password) {
  const users = await getUsers()
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  }
  users.push(newUser)
  await saveUsers(users)
  return newUser
}

export async function verifyPassword(inputPassword, hashedPassword) {
  return bcrypt.compare(inputPassword, hashedPassword)
}

