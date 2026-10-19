import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { signalsChanged } from "@/lib/signalList";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_BYTES = 4 * 1024 * 1024; // stay under Vercel's 4.5MB request body limit

// Uploads a replacement signal image to Vercel Blob and points the signal at it.
// (Vercel's filesystem is read-only, so images can't be written into public/.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads aren't configured (BLOB_READ_WRITE_TOKEN missing)" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;

    const signal = await prisma.signal.findUnique({ where: { id } });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 4MB or smaller" }, { status: 400 });
    }

    // Path is built from the signal id only, never from user input
    const blob = await put(`signals/${signal.id}.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true, // new URL each upload, so caches never serve the old image
    });

    await prisma.signal.update({
      where: { id: signal.id },
      data: { imageUrl: blob.url },
    });

    signalsChanged();
    return NextResponse.json({ success: true, imageUrl: blob.url });
  } catch (err) {
    console.error("Error uploading image:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
