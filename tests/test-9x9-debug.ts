import { Card } from "../lib/game";

// Inline the function to debug
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  let currentIndex = arr.length;

  let random =
    seed !== undefined
      ? (() => {
          let s = seed;
          return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
          };
        })()
      : Math.random;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
}

function generateCardDebug(seed?: number): Card {
  const columnRanges: [number, number][] = [
    [1, 9],
    [10, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
    [80, 90],
  ];

  const card: Card = Array.from({ length: 9 }, () => Array(9).fill(null));

  const columnNumbers: number[][] = columnRanges.map(([min, max]) => {
    const nums: number[] = [];
    for (let i = min; i <= max; i++) {
      nums.push(i);
    }
    return nums;
  });

  console.log(
    "Column sizes:",
    columnNumbers.map((c) => c.length),
  );

  for (let col = 0; col < 9; col++) {
    columnNumbers[col] = shuffleArray(
      columnNumbers[col],
      seed ? seed + col : undefined,
    );
  }

  const rowColumnAssignments: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false),
  );

  const permutations: number[][] = [];
  for (let p = 0; p < 5; p++) {
    const perm = Array.from({ length: 9 }, (_, i) => i);
    permutations.push(shuffleArray(perm, seed ? seed + p * 1000 : undefined));
  }

  console.log("\nPermutations:");
  permutations.forEach((p, i) => console.log(`  P${i}: [${p.join(", ")}]`));

  for (let p = 0; p < 5; p++) {
    for (let row = 0; row < 9; row++) {
      const col = permutations[p][row];
      rowColumnAssignments[row][col] = true;
    }
  }

  console.log("\nRow assignments (columns selected per row):");
  for (let row = 0; row < 9; row++) {
    const cols = rowColumnAssignments[row]
      .map((hasNum, col) => (hasNum ? col : -1))
      .filter((c) => c >= 0);
    console.log(`  Row ${row}: [${cols.join(", ")}] (${cols.length} columns)`);
  }

  console.log("\nColumn assignments (rows selected per column):");
  for (let col = 0; col < 9; col++) {
    const rows = [];
    for (let row = 0; row < 9; row++) {
      if (rowColumnAssignments[row][col]) rows.push(row);
    }
    console.log(`  Col ${col}: [${rows.join(", ")}] (${rows.length} rows)`);
  }

  const columnNumberIndex: number[] = Array(9).fill(0);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (rowColumnAssignments[row][col]) {
        if (columnNumberIndex[col] < columnNumbers[col].length) {
          card[row][col] = columnNumbers[col][columnNumberIndex[col]];
          columnNumberIndex[col]++;
        }
      }
    }
  }

  console.log("\nNumbers used per column:", columnNumberIndex);

  return card;
}

const card = generateCardDebug(12345);

console.log("\n\nFinal card:");
console.log("┌────┬────┬────┬────┬────┬────┬────┬────┬────┐");
for (let row = 0; row < 9; row++) {
  let line = "│";
  for (let col = 0; col < 9; col++) {
    const cell = card[row][col];
    if (cell === null) {
      line += "    │";
    } else {
      line += " " + cell.toString().padStart(2, " ") + " │";
    }
  }
  console.log(line);
  if (row < 8) {
    console.log("├────┼────┼────┼────┼────┼────┼────┼────┼────┤");
  }
}
console.log("└────┴────┴────┴────┴────┴────┴────┴────┴────┘");
