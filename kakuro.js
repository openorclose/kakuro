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
let getPossibleCombinations = (() => {
    let map = {};
    function insertSorted(array, value) {
        let low = 0, high = array.length;
        while (low < high) {
            let mid = (low + high) >>> 1;
            if (array[mid] < value) low = mid + 1;
            else high = mid;
        }
        return array.substring(0, low) + value + array.substring(low);
    }
    return (sum, numSquares, usedNumbers = "") => {
        let key = [sum, numSquares, usedNumbers].toString();
        if (map[key]) {
            return map[key];
        }
        if (numSquares === 1) {
            return map[key] = usedNumbers.includes(sum) || sum > 9 || sum < 1 ? null : [String(sum)];
        }
        let possibleValues = [];
        let max = Math.min(sum, 9);
        for (let i = 1; i < max; i++) {
            if (!usedNumbers.includes(i)) {
                let lowerStep = getPossibleCombinations(sum - i, numSquares - 1, insertSorted(usedNumbers, i));
                if (lowerStep) {
                    for (let possibleValue of lowerStep) {
                        if (possibleValue) {
                            possibleValue = insertSorted(possibleValue, i);
                            if (!possibleValues.includes(possibleValue)) {
                                possibleValues.push(possibleValue);
                            }
                        }
                    }
                }
            }
        }
        return map[key] = possibleValues;
    }
})();
let clueCells = [];
let numberCells = [];
class Sum {
    constructor(sum) {
        this.sum = sum;
        this.unused = [1,2,3,4,5,6,7,8,9];
        this.possibleCombinations = [];
    }
    updatePossibleDigits() {
        this.possibleDigits = [...new Set([...this.possibleCombinations.join("")].map(Number))]
    }
    addUsedDigit(digit) {
        this.unused = this.unused.filter(x=>x!==digit);
        this.possibleCombinations = this.possibleCombinations.filter(x=>x.includes(digit));
        this.updatePossibleDigits();
    }
}
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
            data.confirmed = 0;
            numberCells.push(data);
        }
        if (hasRight) {
            data.right = new Sum(parseInt(/r(\d+)/.exec(cell)[1], 10));
        }
        if (hasDown) {
            data.down =  new Sum(parseInt(/d(\d+)/.exec(cell)[1], 10));
        }
        data.type = type;
        if (type === Type.clue) {
            clueCells.push(data);
        }
        return data;
    })
);
for (let clue of clueCells) {
    if (clue.right) {
        let row = clue.pos.row;
        let col = clue.pos.col + 1;
        let currCell = grid[row][col];
        let numCells = 0;
        while (currCell && currCell.type === Type.number) {
            numCells++;
            currCell.ownedByHorizontal = clue;
            currCell = grid[row][++col];
        }
        clue.right.possibleCombinations = getPossibleCombinations(clue.right.sum, numCells);
        clue.right.updatePossibleDigits();
    }
    if (clue.down) {
        let row = clue.pos.row + 1;
        let col = clue.pos.col;
        let currCell = grid[row][col];
        let numCells = 0;
        while (currCell && currCell.type === Type.number) {
            numCells++;
            currCell.ownedByVertical = clue;
            currCell = grid[++row] && grid[row][col];
        }
        clue.down.possibleCombinations = getPossibleCombinations(clue.down.sum, numCells);
        clue.down.updatePossibleDigits();
    }
}
let isNarrowedDown = true;
while (isNarrowedDown) {
    isNarrowedDown = false;
    for (let cell of numberCells) {
        if (!cell.confirmed) {
            let horizontalOwner = cell.ownedByHorizontal;
            let verticalOwner = cell.ownedByVertical;
            let possibilities = horizontalOwner.right.possibleDigits.filter(mustBeInAll=>
                verticalOwner.down.possibleDigits.includes(mustBeInAll) &&
                horizontalOwner.right.unused.includes(mustBeInAll) &&
                verticalOwner.down.unused.includes(mustBeInAll)
            );
            if (possibilities.length === 1) {
                let answer = possibilities[0];
                cell.confirmed = answer;
                verticalOwner.down.addUsedDigit(answer);
                horizontalOwner.right.addUsedDigit(answer);
                isNarrowedDown = true;
            }
        }
    }
}
console.log(numberCells.map(x=>x.confirmed).join("|"));