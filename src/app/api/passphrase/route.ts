import { NextResponse } from "next/server";
import { generatePassphrase } from "@/lib/passphrase";

export async function POST() {
  const passphrase = generatePassphrase();
  return NextResponse.json({ passphrase });
}
