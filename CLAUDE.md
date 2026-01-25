# Jiggered Puzzle Solver

A web app to digitize and solve Jiggered puzzles from the Otago Daily Times (ODT).

## What is Jiggered?

A word puzzle from the Otago Daily Times (ODT) combining jigsaw and crossword elements:

- An empty grid (15x15) where pieces will be placed
- Separate 3x3 letter tiles shown below the grid
- One tile is pre-placed/fixed in the grid (starting point)
- Drag remaining tiles onto the grid so words read correctly across AND down

### Puzzle Layout (from newspaper)

```
┌─────────────────────────┐
│                         │
│   Empty 15x15 Grid      │  ← 25 tiles (5×5) go here
│   (one letter given)    │
│                         │
├─────────────────────────┤
│ 25 loose 3x3 tiles      │  ← Tiles to arrange
└─────────────────────────┘
```

### Example 3x3 Tile

```
┌───┬───┬───┐
│ S │ O │ N │
├───┼───┼───┤
│ E │ M │ O │
├───┼───┼───┤
│ D │ E │ L │
└───┴───┴───┘
```

## User Flow

1. **Laptop**: Open site → Click "Play" → Enter passphrase → Solve puzzle
2. **Mobile**: Open site → Click "Scan" → Get passphrase → Photograph puzzle → AI extracts pieces

## Tech Stack

- **Framework**: Next.js 16+ (App Router) + Tailwind CSS
- **Hosting**: Vercel (serverless)
- **Storage**: Upstash Redis (puzzles auto-expire after 24h)
- **AI**: OpenAI GPT-4o-mini for image parsing

## Project Structure

```
/src/app
  /page.tsx              # Landing page with Scan/Play buttons
  /scan/page.tsx         # Mobile: camera + passphrase generation
  /play/page.tsx         # Desktop: puzzle solver UI
  /api
    /passphrase/route.ts # Generate 4-word passphrase
    /puzzle/route.ts     # GET/POST puzzle data
    /parse/route.ts      # OpenAI image parsing
/src/lib
  /passphrase.ts         # Passphrase word list + generator
  /redis.ts              # Upstash Redis client
/examples                # Sample puzzles from ODT
```

## Data Model

```typescript
interface PuzzlePiece {
  id: string;
  letters: string[][]; // 3x3 array of letters
  isFixed: boolean; // Blue-bordered piece in newspaper
}

interface Puzzle {
  passphrase: string;
  pieces: PuzzlePiece[];
  gridSize: { rows: number; cols: number };
  createdAt: number;
}
```

## Key Design Decisions

- **Passphrase format**: 4 lowercase words, hyphenated (e.g., "apple-river-cloud-fish")
- **No auth**: Sessionless, puzzles auto-expire after 24 hours
- **Mobile-first scan**: Camera API with fallback to file upload
- **Desktop-first play**: Drag-and-drop optimized for mouse/trackpad

## API Endpoints

- `POST /api/passphrase` - Generate a new 4-word passphrase
- `POST /api/puzzle` - Store puzzle data `{ passphrase, puzzleData }`
- `GET /api/puzzle?passphrase=...` - Fetch puzzle by passphrase
- `POST /api/parse` - Parse puzzle image with OpenAI `{ image, mimeType }`

## AI Image Parsing

The `POST /api/parse` endpoint extracts puzzle data from a newspaper photo:

1. **Grid size** - 15x15 (25 tiles × 3x3 each)
2. **Fixed tile** - position and letters of the pre-placed tile
3. **Loose tiles** - array of 3x3 letter grids

Note: Photos may be rotated/upside-down - AI should handle orientation.

Example output:

```json
{
  "gridSize": { "rows": 15, "cols": 15 },
  "fixedTile": {
    "letters": [
      ["D", "E", "L"],
      ["P", "S", "O"],
      ["I", "R", "D"]
    ],
    "position": { "row": 3, "col": 3 }
  },
  "tiles": [
    {
      "letters": [
        ["S", "O", "N"],
        ["E", "M", "O"],
        ["D", "E", "L"]
      ]
    },
    {
      "letters": [
        ["T", "U", "L"],
        ["O", "Z", "I"],
        ["N", "G", "E"]
      ]
    }
  ]
}
```

## Environment Variables

Create `.env.local`:
```
OPENAI_API_KEY=sk-...              # Required for image parsing
UPSTASH_REDIS_REST_URL=https://... # From Upstash console
UPSTASH_REDIS_REST_TOKEN=...       # From Upstash console
```

## Commands

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # ESLint
```

## Example Images

See `/examples/example_001/` for a complete puzzle from the ODT:

- `puzzle_details.jpg` - The 25 loose 3x3 tiles (unsolved)
- `playspace.jpg` - Empty 15x15 grid with starting letter "P"
- `puzzle_data.txt` - Manually extracted tile data from puzzle_details.jpg

## Newspaper Instructions

Jiggered

The challenge is to rearrange a crossword which has been broken into 25 sections.
One letter has been given to get you started.
Work out which 3x3 square fits in with that letter and write in the letters.
You can also shade the black squars if you find it helpful.
After complete the first 3x3 area, work out wich square joins on to it, and continue until you have a complete crossword.
