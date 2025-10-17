export function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables')
    return false
  }
  return true
}

export function isBuildTime() {
  return !process.env.DATABASE_URL || process.env.VERCEL
}
