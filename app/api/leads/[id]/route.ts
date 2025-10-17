import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { checkDatabaseConnection, isBuildTime } from "@/lib/check-env"

// 静的生成を無効化
export const dynamic = 'force-dynamic'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()

    const lead = await prisma.lead.update({
      where: {
        id: id
      },
      data: body
    })

    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ビルド時はダミーレスポンスを返す
    if (isBuildTime()) {
      return NextResponse.json({ success: true })
    }

    if (!checkDatabaseConnection()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.lead.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    )
  }
}