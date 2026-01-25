import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Puzzle data expires after 24 hours (in seconds)
export const PUZZLE_TTL = 24 * 60 * 60;

export interface StoredPuzzle {
  puzzleData: unknown;
  createdAt: number;
}
