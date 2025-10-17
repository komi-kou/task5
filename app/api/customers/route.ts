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

    const customers = await prisma.customer.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        contacts: true,
        tasks: true,
        opportunities: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // ビルド時はダミーレスポンスを返す
    if (isBuildTime()) {
      return NextResponse.json({ id: "dummy", name: "Dummy Customer" })
    }

    if (!checkDatabaseConnection()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      email, 
      phone, 
      company, 
      address, 
      notes,
      status,
      contractDate,
      contractAmount,
      contractDetails,
      industry,
      employeeCount,
      annualRevenue
    } = body

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
        status: status || 'active',
        contractDate: contractDate ? new Date(contractDate) : null,
        contractAmount: contractAmount || 0,
        contractDetails,
        industry,
        employeeCount: employeeCount || null,
        annualRevenue: annualRevenue || null,
        userId: session.user.id
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create customer" },
      { status: 500 }
    )
  }
}