// Demo puzzle data from examples/example_001/puzzle_data.txt
// Use passphrase "demo" to load this without calling the AI API
// Use passphrase "demo-ai" to test the AI parsing pipeline

export const DEMO_PASSPHRASE = "demo";
export const DEMO_AI_PASSPHRASE = "demo-ai";

export const demoPuzzleData = {
  gridSize: { rows: 15, cols: 15 },
  tiles: [
    // Row 1 of tiles (tiles 1-5)
    { letters: [["H", "E", "R"], ["A", "-", "-"], ["R", "E", "-"]] },
    { letters: [["D", "-", "-"], ["E", "C", "T"], ["N", "-", "I"]] },
    { letters: [["-", "-", "L"], ["R", "A", "Y"], ["-", "L", "-"]] },
    { letters: [["D", "-", "N"], ["O", "-", "D"], ["W", "-", "S"]] },
    { letters: [["-", "S", "O"], ["-", "E", "-"], ["A", "T", "H"]] },
    // Row 2 of tiles (tiles 6-10)
    { letters: [["H", "-", "P"], ["O", "-", "O"], ["E", "A", "U"]] },
    { letters: [["R", "-", "R"], ["O", "-", "O"], ["U", "N", "T"]] },
    { letters: [["E", "R", "A"], ["-", "-", "R"], ["W", "R", "E"]] },
    { letters: [["L", "-", "-"], ["G", "-", "P"], ["A", "-", "-"]] },
    { letters: [["S", "T", "E"], ["-", "-", "-"], ["A", "I", "R"]] },
    // Row 3 of tiles (tiles 11-15)
    { letters: [["N", "-", "-"], ["-", "S", "T"], ["T", "-", "A"]] },
    { letters: [["-", "A", "-"], ["-", "M", "-"], ["A", "N", "A"]] },
    { letters: [["O", "A", "C"], ["-", "N", "-"], ["-", "O", "G"]] },
    { letters: [["I", "-", "R"], ["N", "-", "A"], ["K", "E", "B"]] },
    { letters: [["I", "-", "R"], ["O", "W", "E"], ["U", "-", "M"]] },
    // Row 4 of tiles (tiles 16-20)
    { letters: [["-", "-", "N"], ["I", "N", "G"], ["V", "-", "E"]] },
    { letters: [["B", "R", "E"], ["I", "-", "-"], ["L", "-", "C"]] },
    { letters: [["B", "-", "-"], ["L", "-", "-"], ["E", "-", "I"]] },
    { letters: [["Y", "E", "D"], ["-", "-", "-"], ["R", "D", "-"]] },
    { letters: [["-", "R", "-"], ["I", "A", "L"], ["-", "K", "I"]] },
    // Row 5 of tiles (tiles 21-25)
    { letters: [["-", "D", "-"], ["-", "Z", "O"], ["-", "E", "-"]] },
    { letters: [["E", "L", "A"], ["-", "O", "-"], ["O", "W", "A"]] },
    { letters: [["P", "S", "O"], ["U", "-", "U"], ["P", "O", "R"]] },
    { letters: [["A", "D", "T"], ["S", "-", "-"], ["H", "A", "T"]] },
    { letters: [["I", "-", "-"], ["L", "U", "T"], ["-", "N", "-"]] },
  ],
};
