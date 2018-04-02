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
let grid = [
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
        this.usedDigits = [];
        this.unused = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.possibleCombinationsIgnoringCurrentState =
        this.possibleCombinations = [];
        this.ownedCells = [];
    }
    updatePossibleCombinationsAndDigits() {
        this.possibleCombinations = this.possibleCombinationsIgnoringCurrentState.filter(x => this.usedDigits.every(used => x.includes(used)));
        this.possibleDigits = [...new Set([...this.possibleCombinations.join("")].map(Number))]
    }
    addUsedDigit(digit) {
        this.unused = this.unused.filter(x => x !== digit);
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
}
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
        clue.right.possibleCombinationsIgnoringCurrentState = getPossibleCombinations(clue.right.sum, numCells);
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
        clue.down.possibleCombinationsIgnoringCurrentState = getPossibleCombinations(clue.down.sum, numCells);
        clue.down.updatePossibleCombinationsAndDigits();
    }
}
let allNumberCells = [...numberCells];
let isNarrowedDown = true;
while (isNarrowedDown) {
    isNarrowedDown = false;
    for (let cell of numberCells) {
        if (!cell.confirmed) {
            cell.updatePossibleDigits();
            let possibilities = cell.possibleDigits;

            if (possibilities.length === 1) {
                let answer = possibilities[0];
                cell.confirmed = answer;
                numberCells.splice(numberCells.indexOf(cell), 1);
                cell.callOnBothOwners("addUsedDigit", answer);
                isNarrowedDown = true;
            }
            cell.potentials = possibilities;
        }
    }
}
console.log(allNumberCells.map(x=>x.confirmed).join("|"));
function inverse (a) {
    return [1,2,3,4,5,6,7,8,9].filter(x=>!a.includes(x));
}
function bruteForce(index) {
    //console.log(index);
    let cell = numberCells[index];
    if (index === numberCells.length - 1) {
        if (cell.potentials.length === 1) {
            cell.guess = cell.potentials[0];
            return true;
        } else {
            return false;
        }
    }
    for (let guess of cell.potentials) {
        cell.guess = guess;
        cell.verticalOwner.down.addUsedDigit(guess);
        cell.horizontalOwner.right.addUsedDigit(guess);
        for (let affectedCell of cell.verticalOwner.down.ownedCells.concat(cell.horizontalOwner.right.ownedCells)) {
            let horizontalOwner = affectedCell.horizontalOwner;
            let verticalOwner = affectedCell.verticalOwner;
            let possibilities = horizontalOwner.right.possibleDigits.filter(mustBeInAll =>
                verticalOwner.down.possibleDigits.includes(mustBeInAll) &&
                inverse(horizontalOwner.right.usedDigits).includes(mustBeInAll) &&
                inverse(verticalOwner.down.usedDigits).includes(mustBeInAll)
            );
            affectedCell.potentials = possibilities;
        }
        if (bruteForce(index + 1)) {
            return true;
        }
        cell.guess = 0;
        cell.horizontalOwner.right.removeUsedDigit(guess);
        cell.verticalOwner.down.removeUsedDigit(guess);
        for (let affectedCell of cell.verticalOwner.down.ownedCells.concat(cell.horizontalOwner.right.ownedCells)) {
            let horizontalOwner = affectedCell.horizontalOwner;
            let verticalOwner = affectedCell.verticalOwner;
            let possibilities = horizontalOwner.right.possibleDigits.filter(mustBeInAll =>
                verticalOwner.down.possibleDigits.includes(mustBeInAll) &&
                inverse(horizontalOwner.right.usedDigits).includes(mustBeInAll) &&
                inverse(verticalOwner.down.usedDigits).includes(mustBeInAll)
            );
            affectedCell.potentials = possibilities;
        }
    }
}
bruteForce(0);
console.log(numberCells.map(x => x.guess).join("|"));