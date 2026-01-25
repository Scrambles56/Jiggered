import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export interface PuzzleTile {
  letters: string[][];
}

export interface ParsedPuzzle {
  gridSize: { rows: number; cols: number };
  fixedTile?: {
    letters: string[][];
    position: { row: number; col: number };
  };
  tiles: PuzzleTile[];
}

const PARSE_PROMPT = `You are analyzing a photograph of a "Jiggered" puzzle from a newspaper.

The puzzle consists of 25 separate 3x3 letter tiles that need to be arranged into a 15x15 grid to form valid crossword words.

Please extract ALL 25 tiles from the image. Each tile is a 3x3 grid of letters. Some cells may be black/empty (represent these as "-").

The image may be rotated - please orient the letters correctly so they read normally.

Return the data as JSON in this exact format:
{
  "gridSize": { "rows": 15, "cols": 15 },
  "tiles": [
    { "letters": [["A","B","C"],["D","E","F"],["G","H","I"]] },
    ... (25 tiles total)
  ]
}

Important:
- Extract exactly 25 tiles
- Each tile must have exactly 3 rows and 3 columns
- Use "-" for black/empty cells
- Use uppercase letters
- Order tiles left-to-right, top-to-bottom as they appear in the image`;

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PARSE_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as ParsedPuzzle;

    // Validate the response
    if (!parsed.tiles || !Array.isArray(parsed.tiles)) {
      return NextResponse.json(
        { error: "Invalid response: missing tiles array" },
        { status: 500 }
      );
    }

    if (parsed.tiles.length !== 25) {
      console.warn(`Expected 25 tiles, got ${parsed.tiles.length}`);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error parsing puzzle:", error);
    return NextResponse.json(
      { error: "Failed to parse puzzle image" },
      { status: 500 }
    );
  }
}
