import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Jiggered
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Solve Jiggered puzzles from the Otago Daily Times. Scan on your phone,
          solve on your laptop.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/scan"
            className="flex h-14 w-48 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Scan
          </Link>
          <Link
            href="/play"
            className="flex h-14 w-48 items-center justify-center rounded-xl bg-zinc-900 text-lg font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Play
          </Link>
        </div>

        <p className="mt-4 max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
          <strong>Scan</strong> on mobile to photograph the puzzle.
          <br />
          <strong>Play</strong> on laptop to solve it.
        </p>
      </main>
    </div>
  );
}
