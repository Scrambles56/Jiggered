import Anthropic from "@anthropic-ai/sdk";

export interface PuzzleTile {
  letters: string[][];
}

export interface ParsedPuzzle {
  gridSize: { rows: number; cols: number };
  tiles: PuzzleTile[];
}

// ============================================================================
// MODEL CONFIGURATION
// Set VISION_MODEL env var to switch models:
//   claude-opus-4-5-20251101    (default - best accuracy, Opus 4.5)
//   claude-opus-4-20250514      (Opus 4)
//   claude-sonnet-4-20250514    (good accuracy, cheaper)
//   claude-haiku-3-5-20241022   (budget option ~$0.003/image)
// ============================================================================
const DEFAULT_MODEL = "claude-opus-4-5-20251101";

// Single-pass prompt that outputs JSON directly
const PARSE_PROMPT = `This is a cropped image of 25 letter tiles from a Jiggered puzzle, arranged in a 5×5 grid.

IMPORTANT - ORIENTATION CHECK:
- Letters should be UPRIGHT and readable (not sideways or upside-down)
- If letters appear rotated, mentally rotate the image so letters are upright before reading
- Common letters to check orientation: E, F, L, N, Z - these look different when rotated

GRID STRUCTURE:
- 5 rows × 5 columns = 25 tiles total
- Each tile is a 3×3 grid of cells
- Cells contain either uppercase letters (A-Z) or black/filled squares

HOW TO READ:
1. Orient the image so all letters are upright and readable
2. Read tiles left-to-right, top-to-bottom (Tile 1 = top-left, Tile 25 = bottom-right)
3. For each tile, read 3 rows of 3 characters each
4. Use uppercase letters for letter cells, hyphen (-) for black squares

OUTPUT FORMAT - JSON array of 25 tiles, each tile is 3 strings (rows):
[
  ["HER","A--","RE-"],
  ["D--","ECT","N-I"],
  ... (25 tiles total)
]

Output ONLY the JSON array. No explanation, no markdown.`;

/**
 * Parse a puzzle image using Claude's vision API
 * Returns parsed tile data in a single API call
 */
export async function parsePuzzleImage(
  base64Image: string,
  mimeType: string = "image/jpeg",
): Promise<ParsedPuzzle> {
  const model = process.env.VISION_MODEL || DEFAULT_MODEL;
  console.log(`Parsing puzzle with model: ${model}`);

  // Strip data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: PARSE_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No response from Claude");
  }

  console.log("Raw response:", textBlock.text.substring(0, 200) + "...");

  // Extract JSON array from response
  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON array found in response");
  }

  // Parse the array of tiles
  const tilesArray = JSON.parse(jsonMatch[0]) as string[][];

  if (!Array.isArray(tilesArray) || tilesArray.length === 0) {
    throw new Error("Invalid response: not an array of tiles");
  }

  // Convert string[][] format to PuzzleTile[] format
  const tiles: PuzzleTile[] = tilesArray.map((tile) => ({
    letters: tile.map((row) => row.split("")),
  }));

  if (tiles.length !== 25) {
    console.warn(`Expected 25 tiles, got ${tiles.length}`);
  }

  return {
    gridSize: { rows: 15, cols: 15 },
    tiles,
  };
}
