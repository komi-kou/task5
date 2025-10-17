import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { checkDatabaseConnection, isBuildTime } from "@/lib/check-env"

// 静的生成を無効化
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const databaseUrl = process.env.DATABASE_URL
  console.log('Health - Database URL configured:', databaseUrl ? 'Yes' : 'No')
  console.log('Health - NODE_ENV:', process.env.NODE_ENV)
  
  // ビルド時はダミーレスポンスを返す
  if (isBuildTime()) {
    return NextResponse.json({
      status: 'healthy',
      database: 'not_configured',
      userCount: 0,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: 'not configured',
      buildTime: true
    })
  }

  if (!checkDatabaseConnection()) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'not_configured',
      error: 'DATABASE_URL is not configured',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: 'not configured'
    }, { status: 503 })
  }
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

  try {
    // データベース接続テスト
    await prisma.$connect()
    
    // ユーザー数を取得してデータベースが動作しているか確認
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}