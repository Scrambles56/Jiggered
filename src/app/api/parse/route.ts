import { NextRequest, NextResponse } from "next/server";
import { parsePuzzleImage } from "@/lib/puzzle-parser";

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const parsed = await parsePuzzleImage(base64Data, mimeType);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error parsing puzzle:", error);
    return NextResponse.json(
      { error: "Failed to parse puzzle image" },
      { status: 500 }
    );
  }
}
