import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const day = await prisma.day.create({
      data: {
        date: new Date(body.date),
        title: body.title,
        notes: body.notes || null,
        tripId: params.id,
      },
    });
    return NextResponse.json(day, { status: 201 });
  } catch (error) {
    console.error("Failed to create day:", error);
    return NextResponse.json({ error: "Failed to create day" }, { status: 500 });
  }
}
