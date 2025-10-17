import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { checkDatabaseConnection, isBuildTime } from "@/lib/check-env"

// 静的生成を無効化
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // ビルド時はダミーデータを返す
    if (isBuildTime()) {
      return NextResponse.json([])
    }

    if (!checkDatabaseConnection()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // ビルド時はダミーレスポンスを返す
    if (isBuildTime()) {
      return NextResponse.json({ id: "dummy", name: "Dummy Lead" })
    }

    if (!checkDatabaseConnection()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, company, source, status, notes, score } = body

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        status: status || "new",
        notes,
        score: score || 0,
        userId: session.user.id
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Lead creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 500 }
    )
  }
}