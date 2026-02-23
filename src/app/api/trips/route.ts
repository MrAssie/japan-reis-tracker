import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        _count: { select: { days: true, budgetItems: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trip = await prisma.trip.create({
      data: {
        name: body.name,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalBudget: body.totalBudget || 0,
        coverImage: body.coverImage || null,
      },
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Failed to create trip:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
