let Type = {
    clue: Symbol("clue"),
    unused: Symbol("unused"),
    number: Symbol("number"),
};
let grid = [
    "bd3d4bbbbd15d3",
    "r4nnd16d6br3nn",
    "r10nnnnd14[d16r7]nn",
    "bb[d21r16]nnnnnb",
    "br3nn[d3r11]nnnb",
    "br6nnn[d4r10]nnb",
    "b[d4r19]nnnnnd3d4",
    "r6nnbr10nnnn",
    "r7nnbbbr4nn"
];
const range = (start, end) => Array.from({
    length: (end - start)
}, (v, k) => k + start);
let clueCells = [];
grid = grid.map(x => x.match(/\[.*]|\w\d*/g)).map((row, rowIndex) =>
    row.map((cell, colIndex) => {
        let data = {
            pos: {
                row: rowIndex,
                col: colIndex,
            }
        };
        let firstChar = cell[0];
        let type = Type.clue;
        let hasDown = firstChar === "[" || firstChar === "d";
        let hasRight = firstChar === "[" || firstChar === "r";
        if (firstChar === "b") {
            type = Type.unused;
        } else if (firstChar === "n") {
            type = Type.number;
        }
        if (hasRight) {
            data.right = {
                sum: parseInt(/r(\d+)/.exec(cell)[1], 10),
            };
        }
        if (hasDown) {
            data.down = {
                sum: parseInt(/d(\d+)/.exec(cell)[1], 10),
            };
        }
        data.type = type;
        if (type === Type.clue) {
            clueCells.push(data);
        }
        return data;
    })
);
console.log("test");
for (let clue of clueCells) {
    let ownedCells = [];
    if (clue.right) {
        let row = clue.pos.row;
        let col = clue.pos.col + 1;
        let currCell = grid[row][col];
        while (currCell && currCell.type === Type.number) {
            currCell.ownedBy = clue;
            ownedCells.push(currCell);
            currCell = grid[row][++col];
        }
    }
    if (clue.down) {
        let row = clue.pos.row + 1;
        let col = clue.pos.col;
        let currCell = grid[row][col];
        while (currCell && currCell.type === Type.number) {
            currCell.ownedBy = clue;
            ownedCells.push(currCell);
            currCell = grid[++row] && grid[row][col];
        }
    }
}

console.log(JSON.stringify(grid));