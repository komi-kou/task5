import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { checkDatabaseConnection, isBuildTime } from "@/lib/check-env"

// 静的生成を無効化
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ビルド時はダミーデータを返す
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

    const { id } = await params

    const customer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        contacts: true,
        tasks: true,
        opportunities: true
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // 契約日を適切な形式に変換
    if (body.contractDate) {
      body.contractDate = new Date(body.contractDate)
    }

    const customer = await prisma.customer.update({
      where: {
        id: id
      },
      data: body
    })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.customer.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}