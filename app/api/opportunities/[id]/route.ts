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
      return NextResponse.json({ id: "dummy", name: "Dummy Opportunity" })
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
    const updateData: any = { ...body }
    
    if (body.closeDate) {
      updateData.closeDate = new Date(body.closeDate)
    }

    const opportunity = await prisma.opportunity.update({
      where: {
        id: id
      },
      data: updateData
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update opportunity" },
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

    await prisma.opportunity.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete opportunity" },
      { status: 500 }
    )
  }
}