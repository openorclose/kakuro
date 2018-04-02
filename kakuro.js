/*
Test on kakuros.com
let sol = "2|6|3|2|1|2|4|1|2|3|5|6|3|1|9|3|8|2|1|9|3|1|5|2|8|1|7|9|3|5|4|8|1|6|5|3|9|1|6|9|8|4|9|4|5|6|8|1|6|1|9|3|8|1|7|9|8|6|3|8|4|2|9|1|9|2|3|8|2|6|1|7|8|8|9|3|6|1|9|2|2|8|1|9|1|8|1|9|8|3|9|7|9|1|9|6|8|1|7|5|1|2|6|3|5|7|9|7|1|9|2|3|7|3|8|9|2|1|3|9|1|1|8|9|3|5|1|5|7|8|2|3|2|1|1|9|3|6|1|2|9|2|6|1|7|4|3|9|7|2|1|3|7|9|8|7|4|7|5|1|8|3|9|7|6|8|7|5|3|2|9|1|9|3|1|1|4|9|5|8|5|9|8|8|1|2|4|3|6|2|7|9|1|6|3|1|2|9|2|7|8|9|7|3|4|9|4|9|7|8|9|2|3|6|9|4|8|1|5|9|7|2|4|6|8|9|6|8|1|2|8|6|5|9|9|8|2|7|3|1|2|3|7|8|9|5|8|9|3|2|7|8|6|1|4|1|5|9|1|7|2|5|9|4|1|9|2|3|7|9|4|5|3|2|6|7|2|7|1|1|6|1|2|8|1|3|1|2|8|1|3|7|3|9|9|8|5|4|1|7|6|2|8|3|4|9|1|4|9|7|1|3|8|7|9|6|2|2|4|1|2|1|6|3|1|6|2|3|1|9|7|4|9|3|9|4|8|7|2|9|2|3|1|2|8|7|1|2|3|2|5|6|3|1|9|7|1|7|4|5|1|3|8|9|6|1|9|7|1|8|7|2|7|8|9|9|1|8|4|9|3|5|1|9|8|9|1|5|9|5|1|3|9|7|6|7|1|8|6|2|7|9|2|7|1|6|4|9|1|7|1|3|9|8|9|3|1|8|6|9|2|2|9|3|7|2|4|9|3|2|2|9|2|4|7|2|9|7|1|3|4|4|8|3|1|9|1|1|8|1|2|8|7|8|2|4|1|3|7|1|8|5|3|1".split("|");
Array.from(document.getElementsByTagName("td")).filter(e=>e.style.backgroundColor === "rgb(255, 255, 255)").forEach((x,i)=>{x.onclick();kinput(sol[i])})
 */
let Type = {
    clue: Symbol("clue"),
    unused: Symbol("unused"),
    number: Symbol("number"),
};
let grid2 = [
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
let grid3 = [
    "bd16d10bd10d23bbd30d6",
    "r11nn[d24r16]nnd12r7nn",
    "r38nnnnnn[d13r6]nn",
    "br5nn[d21r17]nnnnn",
    "bd19[d31r14]nnd16r10nnd6",
    "r25nnnnnd19r8nn",
    "r10nnr11nnn[d29r11]nn",
    "r14nnd11r29nnnnn",
    "b[d7r15]nnd5[d14r14]nnd21b",
    "r15nnnnn[d8r14]nnd7",
    "r11nnr37nnnnnn",
    "r5nnbr6nnr9nn"
];

let oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function inverse(a) {
    return oneToNine.filter(x => !a.includes(x));
}

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
            if (!usedNumbers.includes(sum) && sum <= 9 && sum >= 1) {
                return map[key] = [String(sum)];
            }
        } else {
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
    }
})();

let clueCells = [];
let numberCells = [];

class Sum {
    constructor(sum) {
        this.sum = sum;
        this.usedDigits = [];
        this.possibleCombinationsIgnoringCurrentState = [];
        this.possibleCombinations = [];
        this.ownedCells = [];
    }

    updatePossibleCombinationsAndDigits() {
        this.possibleCombinations = this.possibleCombinationsIgnoringCurrentState.filter(x => this.usedDigits.every(used => x.includes(used)));
        this.possibleDigits = [...new Set([].concat(...this.possibleCombinations))];
    }

    addUsedDigit(digit) {
        this.usedDigits.push(digit);
        this.updatePossibleCombinationsAndDigits();
    }

    removeUsedDigit(digit) {
        this.usedDigits.splice(this.usedDigits.indexOf(digit), 1);
        this.updatePossibleCombinationsAndDigits();
    }
}

class NumberCell {
    constructor(pos) {
        this.type = Type.number;
        this.confirmed = 0;
        this.pos = pos;
        this.possibleDigits = [];
        this.horizontalOwner = null;
        this.verticalOwner = null;
        this.affectedCells = null;
    }

    updatePossibleDigits() {
        this.possibleDigits = this.horizontalOwner.right.possibleDigits.filter(mustBeInAll =>
            this.verticalOwner.down.possibleDigits.includes(mustBeInAll) &&
            inverse(this.horizontalOwner.right.usedDigits).includes(mustBeInAll) &&
            inverse(this.verticalOwner.down.usedDigits).includes(mustBeInAll)
        );
    }

    callOnBothOwners(method, ...args) {
        this.horizontalOwner.right[method](...args);
        this.verticalOwner.down[method](...args);
    }

    updateAffectedCells() {
        if (!this.affectedCells) {
            this.affectedCells = this.verticalOwner.down.ownedCells.concat(this.horizontalOwner.right.ownedCells);
        }
        this.affectedCells.forEach(affectedCell => affectedCell.updatePossibleDigits());
    }

    setDigit(digit) {
        this.confirmed = digit;
        this.callOnBothOwners("addUsedDigit", digit);
        this.updateAffectedCells();
    }

    resetDigit() {
        this.callOnBothOwners("removeUsedDigit", this.confirmed);
        this.confirmed = 0;
        this.updateAffectedCells();

    }
}

let board = [[-1, -1, -1, -1, 70, 230, -1, -1, -1, -1, -1, -1, -1, -1, 60, 30, -1, -1, -1, 40, 190, 260, -1, -1, 70, 410, 40, 270, 230, -1],
    [-1, -1, -1, 8110, 0, 0, -1, -1, 40, 230, -1, -1, -1, 5000, 0, 0, -1, -1, 7170, 0, 0, 0, -1, 17000, 0, 0, 0, 0, 0, 40],
    [-1, -1, 13000, 0, 0, 0, -1, 11000, 0, 0, -1, 350, 40, 3160, 0, 0, 230, 18170, 0, 0, 0, 0, -1, 30000, 0, 0, 0, 0, 0, 0],
    [-1, -1, 17230, 0, 0, 0, -1, 7000, 0, 0, 18110, 0, 0, 0, 0, 23000, 0, 0, 0, 13230, 0, 0, -1, 9000, 0, 0, 15030, 0, 0, 0],
    [-1, 7030, 0, 0, 290, 170, -1, -1, 28000, 0, 0, 0, 0, 0, 40, 17160, 0, 0, 17000, 0, 0, 0, -1, -1, 15040, 0, 0, 0, 170, 30],
    [23000, 0, 0, 0, 0, 0, -1, 30, 380, 8000, 0, 0, 170, 16000, 0, 0, 0, -1, 17160, 0, 0, -1, -1, 10000, 0, 0, 0, 11210, 0, 0],
    [10000, 0, 0, 10160, 0, 0, 9040, 0, 0, 18060, 0, 0, 0, 12000, 0, 0, 160, 16040, 0, 0, 150, 60, -1, 10000, 0, 0, 15190, 0, 0, 0],
    [-1, -1, 12000, 0, 0, 33060, 0, 0, 0, 0, 0, 0, 0, -1, 40, 17230, 0, 0, 0, 5000, 0, 0, -1, -1, 18000, 0, 0, 0, -1, -1],
    [-1, -1, 15000, 0, 0, 0, 0, 10000, 0, 0, 60, -1, 40, 21160, 0, 0, 0, 0, -1, 6000, 0, 0, -1, -1, 160, 12080, 0, 0, 150, 160],
    [-1, -1, -1, 10000, 0, 0, -1, 6240, 0, 0, 0, 19030, 0, 0, 0, 0, 170, -1, -1, 3160, 0, 0, -1, 17000, 0, 0, 0, 8170, 0, 0],
    [-1, -1, -1, 7280, 0, 0, 16170, 0, 0, 13000, 0, 0, 0, 0, 17000, 0, 0, 30, 11000, 0, 0, 40, -1, 33000, 0, 0, 0, 0, 0, 0],
    [-1, -1, 13170, 0, 0, 20000, 0, 0, 0, 5000, 0, 0, -1, -1, 290, 10030, 0, 0, 13070, 0, 0, 0, 340, -1, 19000, 0, 0, 0, 0, 160],
    [-1, 13000, 0, 0, -1, 17000, 0, 0, -1, 230, 60, -1, -1, 9000, 0, 0, 6330, 0, 0, 290, 9000, 0, 0, 160, -1, -1, 150, 9370, 0, 0],
    [-1, 10000, 0, 0, 290, 160, -1, -1, 9340, 0, 0, 110, -1, 12230, 0, 0, 0, 9240, 0, 0, -1, 17000, 0, 0, -1, 23000, 0, 0, 0, 0],
    [-1, -1, 20000, 0, 0, 0, -1, 22000, 0, 0, 0, 0, 15000, 0, 0, 18000, 0, 0, 0, 0, 230, 16070, 0, 0, -1, 6040, 0, 0, -1, -1],
    [-1, -1, 23000, 0, 0, 0, -1, 17170, 0, 0, 0, 0, 14240, 0, 0, 14000, 0, 0, 26000, 0, 0, 0, 0, -1, 6000, 0, 0, 0, -1, -1],
    [-1, 30, 10260, 0, 0, -1, 17000, 0, 0, -1, 25000, 0, 0, 0, 0, 9040, 0, 0, 19000, 0, 0, 0, 0, -1, 15000, 0, 0, 0, 40, -1],
    [15000, 0, 0, 0, 0, -1, 13000, 0, 0, 30, 10000, 0, 0, 12040, 0, 0, 0, -1, -1, 13000, 0, 0, -1, 70, 30, -1, 8000, 0, 0, -1],
    [8000, 0, 0, 40, 200, 230, -1, 9000, 0, 0, 160, 8160, 0, 0, 7160, 0, 0, -1, -1, 160, 240, -1, 3350, 0, 0, -1, 9410, 0, 0, -1],
    [-1, 14030, 0, 0, 0, 0, 40, -1, 11000, 0, 0, 0, 12000, 0, 0, 60, -1, 40, 17170, 0, 0, 10000, 0, 0, 0, 13060, 0, 0, -1, -1],
    [27000, 0, 0, 0, 0, 0, 0, -1, -1, 13110, 0, 0, -1, 8000, 0, 0, 27040, 0, 0, 0, 0, 8070, 0, 0, 6000, 0, 0, -1, -1, -1],
    [3000, 0, 0, 10070, 0, 0, 0, -1, 7000, 0, 0, -1, -1, 160, 15030, 0, 0, 0, 0, 20000, 0, 0, 0, -1, 12160, 0, 0, 40, -1, -1],
    [-1, -1, 12000, 0, 0, 420, -1, -1, 9000, 0, 0, -1, 15160, 0, 0, 0, 0, -1, 160, 160, 10290, 0, 0, 13170, 0, 0, 0, 0, -1, -1],
    [-1, 170, 13160, 0, 0, 0, 160, -1, 4000, 0, 0, 17070, 0, 0, 0, 170, 160, 37000, 0, 0, 0, 0, 0, 0, 0, 7040, 0, 0, 60, 160],
    [17000, 0, 0, 0, 15030, 0, 0, -1, -1, -1, 9350, 0, 0, -1, 17060, 0, 0, 18000, 0, 0, 0, 13000, 0, 0, 8000, 0, 0, 10300, 0, 0],
    [17000, 0, 0, 15300, 0, 0, 0, -1, -1, 6100, 0, 0, -1, 19160, 0, 0, 0, 160, 13040, 0, 0, 110, -1, -1, 24000, 0, 0, 0, 0, 0],
    [-1, 30, 18240, 0, 0, 0, 70, -1, 11000, 0, 0, 0, 10040, 0, 0, -1, 28100, 0, 0, 0, 0, 0, 170, -1, -1, 60, 12070, 0, 0, -1],
    [15000, 0, 0, 0, 11030, 0, 0, -1, 11000, 0, 0, 12040, 0, 0, 0, 18170, 0, 0, 0, 0, 11000, 0, 0, -1, 13000, 0, 0, 0, -1, -1],
    [26000, 0, 0, 0, 0, 0, 0, -1, 16000, 0, 0, 0, 0, -1, 10000, 0, 0, -1, -1, -1, 9000, 0, 0, -1, 11000, 0, 0, 0, -1, -1],
    [-1, 22000, 0, 0, 0, 0, 0, -1, 11000, 0, 0, 0, -1, -1, 13000, 0, 0, -1, -1, -1, -1, -1, -1, -1, 4000, 0, 0, -1, -1, -1]];

grid = board.map(row =>
    row.map(col => {
        if (col === -1) {
            return "b";
        }
        if (col === 0) {
            return "n";
        }
        if (col < 1000) {
            return "d" + col / 10;
        }
        if (col % 1000 === 0) {
            return "r" + col / 1000;
        }
        return `[d${col / 10 % 100}r${Math.floor(col / 1000)}]`;
    }).join("")
);
console.log(grid);
grid = grid.map(x => x.match(/\[[a-z0-9]*]|\w\d*/g)).map((row, rowIndex) =>
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
            data = new NumberCell(data.pos);
            numberCells.push(data);
        }
        if (hasRight) {
            data.right = new Sum(parseInt(/r(\d+)/.exec(cell)[1], 10));
        }
        if (hasDown) {
            data.down = new Sum(parseInt(/d(\d+)/.exec(cell)[1], 10));
        }
        data.type = type;
        if (type === Type.clue) {
            clueCells.push(data);
        }
        return data;
    })
);
let start = Date.now();
for (let clue of clueCells) {
    if (clue.right) {
        let row = clue.pos.row;
        let col = clue.pos.col + 1;
        let currCell = grid[row][col];
        let numCells = 0;
        while (currCell && currCell.type === Type.number) {
            numCells++;
            currCell.horizontalOwner = clue;
            clue.right.ownedCells.push(currCell);
            currCell = grid[row][++col];
        }
        clue.right.possibleCombinationsIgnoringCurrentState = getPossibleCombinations(clue.right.sum, numCells).map(combination => [...combination].map(Number));
        clue.right.updatePossibleCombinationsAndDigits();
    }
    if (clue.down) {
        let row = clue.pos.row + 1;
        let col = clue.pos.col;
        let currCell = grid[row][col];
        let numCells = 0;
        while (currCell && currCell.type === Type.number) {
            numCells++;
            currCell.verticalOwner = clue;
            clue.down.ownedCells.push(currCell);
            currCell = grid[++row] && grid[row][col];
        }
        clue.down.possibleCombinationsIgnoringCurrentState = getPossibleCombinations(clue.down.sum, numCells).map(combination => [...combination].map(Number));
        clue.down.updatePossibleCombinationsAndDigits();
    }
}
let allNumberCells = [...numberCells];
let isNarrowedDown = true;
numberCells.forEach(cell => cell.updatePossibleDigits());
while (isNarrowedDown) {
    isNarrowedDown = false;
    for (let cell of numberCells) {
        let possibilities = cell.possibleDigits;
        if (possibilities.length === 1) {
            let answer = possibilities[0];
            cell.setDigit(answer);
            numberCells.splice(numberCells.indexOf(cell), 1);
            isNarrowedDown = true;
        }
    }
}

function bruteForce(index) {
    let cell = numberCells[index];
    if (index === 0) {
        if (cell.possibleDigits.length === 1) {
            cell.confirmed = cell.possibleDigits[0];
            return true;
        }
    } else {
        for (let guess of cell.possibleDigits) {
            cell.setDigit(guess);
            if (bruteForce(index - 1)) {
                return true;
            }
            cell.resetDigit();
        }
    }
}

bruteForce(numberCells.length - 1);

console.log((Date.now() - start) / 1000);
console.log(allNumberCells.length);
console.log(allNumberCells.map(x => x.confirmed).join("|"));