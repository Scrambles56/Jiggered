import { NextRequest, NextResponse } from "next/server";
import { redis, PUZZLE_TTL, type StoredPuzzle } from "@/lib/redis";
import { DEMO_PASSPHRASE, demoPuzzleData } from "@/lib/demo-puzzle";

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
    await redis.set(`puzzle:${passphrase}`, JSON.stringify(stored), {
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

    const data = await redis.get<string>(`puzzle:${passphrase}`);

    if (!data) {
      return NextResponse.json(
        { error: "Puzzle not found or expired" },
        { status: 404 }
      );
    }

    const stored: StoredPuzzle = JSON.parse(data);

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
