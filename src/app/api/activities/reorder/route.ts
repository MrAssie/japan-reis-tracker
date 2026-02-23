import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities } = body as {
      activities: { id: string; dayId: string; order: number }[];
    };

    await prisma.$transaction(
      activities.map((a) =>
        prisma.activity.update({
          where: { id: a.id },
          data: { dayId: a.dayId, order: a.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder activities:", error);
    return NextResponse.json({ error: "Failed to reorder activities" }, { status: 500 });
  }
}
