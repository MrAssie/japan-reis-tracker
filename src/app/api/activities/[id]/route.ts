import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        placeId: body.placeId,
        startTime: body.startTime,
        endTime: body.endTime,
        category: body.category,
        cost: body.cost,
        currency: body.currency,
        photoUrl: body.photoUrl,
        rating: body.rating,
        order: body.order,
      },
    });
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.activity.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
