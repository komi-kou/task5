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

    const opportunities = await prisma.opportunity.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, amount, stage, probability, closeDate, description, customerId } = body

    if (!name) {
      return NextResponse.json({ error: "商談名は必須です" }, { status: 400 })
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        name,
        amount: amount || 0,
        stage: stage || "qualification",
        probability: probability || 0,
        closeDate: closeDate ? new Date(closeDate) : null,
        description,
        userId: session.user.id,
        customerId: customerId === 'none' ? null : customerId || null
      }
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error("Opportunity creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create opportunity" },
      { status: 500 }
    )
  }
}