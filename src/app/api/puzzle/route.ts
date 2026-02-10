import { NextRequest, NextResponse } from "next/server";
import { redis, PUZZLE_TTL, type StoredPuzzle } from "@/lib/redis";
import { DEMO_PASSPHRASE, DEMO_AI_PASSPHRASE, demoPuzzleData } from "@/lib/demo-puzzle";
import { generatePassphrase } from "@/lib/passphrase";
import { parsePuzzleImage } from "@/lib/puzzle-parser";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { passphrase, puzzleData } = await request.json();

    if (!passphrase || !puzzleData) {
      return NextResponse.json(
        { error: "Missing passphrase or puzzleData" },
        { status: 400 }
      );
    }

    const stored: StoredPuzzle = {
      puzzleData,
      createdAt: Date.now(),
    };

    // Store with TTL (auto-expires after 24 hours)
    // Upstash Redis automatically handles JSON serialization
    await redis.set(`puzzle:${passphrase}`, stored, {
      ex: PUZZLE_TTL,
    });

    return NextResponse.json({ success: true, passphrase });
  } catch (error) {
    console.error("Error storing puzzle:", error);
    return NextResponse.json(
      { error: "Failed to store puzzle" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const passphrase = searchParams.get("passphrase");

    if (!passphrase) {
      return NextResponse.json(
        { error: "Missing passphrase parameter" },
        { status: 400 }
      );
    }

    // Return demo puzzle for special passphrase (no Redis needed)
    if (passphrase === DEMO_PASSPHRASE) {
      return NextResponse.json({
        passphrase,
        puzzleData: demoPuzzleData,
        createdAt: Date.now(),
      });
    }

    // Test AI parsing with the example image - simulates full scan flow
    if (passphrase === DEMO_AI_PASSPHRASE) {
      // Step 1: Generate a real passphrase (like /api/passphrase does)
      const generatedPassphrase = generatePassphrase();

      // Step 2: Read and parse the example image (like /api/parse does)
      const imagePath = join(process.cwd(), "examples/example_001/puzzle_details.jpg");
      const imageBuffer = readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const puzzleData = await parsePuzzleImage(base64Image, "image/jpeg");

      // Step 3: Store in Redis (like POST /api/puzzle does)
      const stored: StoredPuzzle = {
        puzzleData,
        createdAt: Date.now(),
      };
      // Upstash Redis automatically handles JSON serialization
      await redis.set(`puzzle:${generatedPassphrase}`, stored, {
        ex: PUZZLE_TTL,
      });

      // Step 4: Return redirect so client fetches using the generated passphrase
      return NextResponse.json({
        demoRedirect: true,
        generatedPassphrase,
      });
    }

    // Upstash Redis automatically handles JSON deserialization
    const stored = await redis.get<StoredPuzzle>(`puzzle:${passphrase}`);

    if (!stored) {
      return NextResponse.json(
        { error: "Puzzle not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      passphrase,
      puzzleData: stored.puzzleData,
      createdAt: stored.createdAt,
    });
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
