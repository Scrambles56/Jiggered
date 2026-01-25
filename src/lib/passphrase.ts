// Simple word list for generating memorable passphrases
const words = [
  // Animals
  "cat", "dog", "fox", "owl", "bee", "ant", "cow", "pig", "hen", "ram",
  "bat", "eel", "cod", "elk", "emu", "yak", "ape", "jay", "koi", "pug",
  // Nature
  "oak", "elm", "fir", "bay", "sea", "sun", "sky", "fog", "dew", "ice",
  "mud", "ash", "hay", "moss", "fern", "vine", "rose", "lily", "daisy",
  // Colors
  "red", "blue", "green", "gold", "pink", "gray", "teal", "plum", "mint",
  // Objects
  "cup", "hat", "key", "map", "pen", "box", "bag", "jar", "pot", "pan",
  "bell", "book", "bowl", "lamp", "rope", "soap", "tape", "coin", "dice",
  // Food
  "pie", "jam", "tea", "egg", "fig", "nut", "pea", "rice", "cake", "soup",
  // Places
  "hill", "lake", "pond", "cave", "peak", "glen", "vale", "cove", "reef",
  // Misc
  "star", "moon", "cloud", "rain", "snow", "wind", "storm", "wave", "tide",
];

function getRandomWord(): string {
  return words[Math.floor(Math.random() * words.length)];
}

export function generatePassphrase(): string {
  const selected: string[] = [];
  while (selected.length < 4) {
    const word = getRandomWord();
    if (!selected.includes(word)) {
      selected.push(word);
    }
  }
  return selected.join("-");
}
