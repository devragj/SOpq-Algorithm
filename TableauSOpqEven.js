"use strict";

function getGridSubPos(square) {
        if (square.x % 2 == 1 && square.y % 2 == 0) return "X";
        if (square.x % 2 == 0 && square.y % 2 == 0) return "Y";
        if (square.x % 2 == 1 && square.y % 2 == 1) return "Z";
        if (square.x % 2 == 0 && square.y % 2 == 1) return "W";
}

function oppositeSign(sign) {
        if (sign == "+") return "-";
        if (sign == "-") return "+";
        if (sign == "s") return "t";
        if (sign == "t") return "s";
        throw new Error("Input to oppositeSign is not a sign");
}

class DominoGridShape {
        constructor(rowLengths) {
                if (rowLengths) {
                        this.rowLengths = rowLengths;
                } else {
                        this.rowLengths = [];
                }
        }

        get(x, y) {
                if (this.rowLengths.length <= y) {
                        return false;
                }
                return this.rowLengths[y] > x;
        }

        get rows() {
                return this.rowLengths.length;
        }

        get cols() {
                return this.rowLengths[0];
        }

        getRowLength(i) {
                if (i >= this.rowLengths.length) return 0;
                return this.rowLengths[i];
        }

        getColumnLength(j) {
                if (this.rowLengths.length == 0) return 0;
                if (j >= this.rowLengths[0]) return 0;
                for (let i = 0; i < this.rowLengths.length; i++) {
                        if (this.rowLengths[i] <= j) {
                                return i;
                        }
                }
                return this.rowLengths.length;
        }

}

class DominoGrid {
        constructor(width, height) {
                this.rows = height || 0;
                this.cols = width || 0;
                this.grid = new Array(this.rows);
                for (let r = 0; r < this.grid.length; r++) {
                        this.grid[r] = new Array(this.cols);
                }
        }

        set(x, y, domino) {
                if (this.cols <= x) {
                        this.cols = x + 1;
                }

                if (this.rows <= y) {
                        for (let r = this.rows; r <= y; r++) {
                                this.grid.push(new Array(1));
                        }

                        this.rows = y + 1;
                }

                this.grid[y][x] = domino;
                // return this;
        }

        // TODO check if rows or columns decreased
        unset(x, y) {
                this.grid[y][x] = undefined;
        }

        get(x, y) {
                if (y >= this.rows) {
                        return undefined;
                }

                return this.grid[y][x];
        }

        getNumber(x, y) {
                let dom = this.get(x, y);
                if (dom) return dom.n;
                return undefined;
        }

        addDomino(d) {
                this.set(d.x, d.y, d);
                if (d.horiz) {
                        this.set(d.x + 1, d.y, d);
                } else {
                        this.set(d.x, d.y + 1, d);
                }

                if (d.box) {
                        this.set(d.x + 1, d.y, d);
                        this.set(d.x + 1, d.y + 1, d);
                }
        }

        getRowLength(i) {
                if (this.grid[i] == undefined) return 0;
                for (let j = 0; j < this.cols; j++) {
                        if (this.grid[i][j] === undefined) {
                                return j;
                        }
                }
                return this.cols;
        }

        getColumnLength(j) {
                for (let i = 0; i < this.rows; i++) {
                        if (this.grid[i][j] === undefined) {
                                return i;
                        }
                }
                return this.rows;
        }

        removeExtremal(position) {
                if (position.horiz) {
                        this.grid[position.y].pop();
                        this.grid[position.y].pop();
                        if (position.y == 0) {
                                this.cols -= 2;
                        }

                        if (position.x == 0) {
                                this.grid.pop();
                                this.rows--;
                        }
                } else { // !position.horiz
                        this.grid[position.y + 1].pop();
                        this.grid[position.y].pop();
                        if (position.y == 0) {
                                this.cols--;
                        }

                        if (position.x == 0) {
                                this.grid.pop();
                                this.grid.pop();
                                this.rows -= 2;
                        }
                }
        }
}

class Domino {
        constructor(tbl) {
                this.n = tbl.n;
                this.x = tbl.x;
                this.y = tbl.y;
                this.horiz = tbl.horiz;
                this.box = tbl.box;
        }

        clone() {
                return new Domino(this);
        }

        getVariableSquare() {
                let gsp = getGridSubPos(this);
                if (gsp == "X" || gsp == "W") {
                        return {x: this.x, y: this.y}
                }
                if (this.horiz) {
                        return {x: this.x + 1, y: this.y}
                }
                return {x: this.x, y: this.y + 1}
        }

        getFixedSquare() {
                let gsp = getGridSubPos(this);
                if (gsp == "Y" || gsp == "Z") {
                        return {x: this.x, y: this.y}
                }
                if (this.horiz) {
                        return {x: this.x + 1, y: this.y}
                }
                return {x: this.x, y: this.y + 1}
        }

        isBoxed() {
                if (getGridSubPos(this) == "X") return true;
                if (this.horiz && getGridSubPos(this) == "Z") return true;
                if (!this.horiz && getGridSubPos(this) == "Y") return true;
                return false;
        }

        toString() {
                let dominoString = "(n: " + this.n + ", x: " + this.x + ", y: " + this.y;
                if (!this.box) {
                        dominoString += ", horiz: " + this.horiz;
                }

                dominoString += ")";
                return dominoString;
        }

}

class Tableau {
        constructor(dominoList) {
                this.dominoList = [];
                dominoList.forEach((d) => {
                        if (d.constructor.name != "Domino") {
                                d = new Domino(d);
                        }
                        this.dominoList.push(d);
                });
                this.dominoGrid = new DominoGrid;
                this.regenGrid();
        }

        clone() {
                let ret = new Tableau([]);
                this.dominoList.forEach((d) => { ret.dominoList.push(d.clone()); });
                ret.regenGrid();
                return ret;
        }

        draw() {
                document.body.appendChild(new TableauRendererDOM({tableau: this}).renderDOM());
        }

        insert(domino) {
                let inserted = false;
                for (let i = 0; i < this.dominoList.length; i++) {
                        if (this.dominoList[i].n > domino.n) {
                                this.dominoList.splice(i, 0, domino);
                                inserted = true;
                                break;
                        }
                }

                if (!inserted) {
                        this.dominoList.push(domino);
                }

                this.dominoGrid.addDomino(domino);
        }

        insertAtEnd(domino) {
                this.dominoList.push(domino);
                this.dominoGrid.addDomino(domino);
        }

        getRowLength(i) {
                return this.dominoGrid.getRowLength(i);
        }

        getColumnLength(j) {
                return this.dominoGrid.getColumnLength(j);
        }

        isExtremal(pos) {
                let x = pos.x;
                let y = pos.y;
                if (pos.horiz) {
                        let cond1 = this.getRowLength(y) == x + 2;
                        if (!cond1) return false;
                        let cond2 = this.getColumnLength(x) == y + 1;
                        if (!cond2) return false;
                        let cond3 = this.getColumnLength(x + 1) == y + 1;
                        if (!cond3) return false;
                        return true;
                } else {
                        let cond1 = this.getColumnLength(x) == y + 2;
                        if (!cond1) return false;
                        let cond2 = this.getRowLength(y) == x + 1;
                        if (!cond2) return false;
                        let cond3 = this.getRowLength(y + 1) == x + 1;
                        if (!cond3) return false;
                        return true;
                }
        }

        regenGrid() {
                this.dominoGrid = new DominoGrid;
                this.dominoList.forEach((d) => { this.dominoGrid.addDomino(d);});
        }

        nextRS(rsNumber) {
                let m = rsNumber > 0? rsNumber: -rsNumber;
                let newDomino = new Domino({n: m});
                let dominoGrid = this.dominoGrid;
                let grid = dominoGrid.grid;
                let pos;
                let domino1;
                let domino2;

                function getRowData(y, number) {
                        for (let x = 0; ; x++) {
                                let domino1 = dominoGrid.get(x, y);
                                if (!domino1) {
                                        let rowPos = {x:x, y:y, horiz: true};
                                        return {pos: rowPos};
                                }

                                if (domino1.n > number) {
                                        let rowPos = {x:x, y:y, horiz: true};
                                        let domino2;
                                        if (domino1.horiz) {
                                                domino2 = domino1;
                                        } else {
                                                domino2 = dominoGrid.get(x + 1, y);
                                        }

                                        return {pos: rowPos, domino1: domino1, domino2: domino2};
                                }
                        }
                }

                function getColumnData(x, number) {
                        for (let y = 0; ; y++) {
                                let domino1 = dominoGrid.get(x, y);
                                if (!domino1) {
                                        let columnPos = {x:x, y:y, horiz: false};
                                        return {pos: columnPos};
                                }

                                if (domino1.n > number) {
                                        let columnPos = {x:x, y:y, horiz: false};
                                        let domino2;
                                        if (!domino1.horiz) {
                                                domino2 = domino1;
                                        } else {
                                                domino2 = dominoGrid.get(x, y + 1);
                                        }

                                        return {pos: columnPos, domino1: domino1, domino2: domino2};
                                }
                        }
                }

                let insertData;
                if (rsNumber > 0) {
                        insertData = getRowData(0, m);
                } else { // rsNumber < 0
                        insertData = getColumnData(0, m);
                }

                pos = insertData.pos;
                domino1 = insertData.domino1;
                domino2 = insertData.domino2;
                newDomino.x = pos.x;
                newDomino.y = pos.y;
                newDomino.horiz = pos.horiz;
                this.insert(newDomino);

                while(domino1) {
                        if (pos.horiz) {
                                if (domino1.horiz) {
                                        insertData = getRowData(domino1.y + 1, domino1.n);
                                        pos = insertData.pos;
                                        domino1.x = pos.x;
                                        domino1.y = pos.y;
                                        dominoGrid.set(pos.x, pos.y, domino1);
                                        dominoGrid.set(pos.x + 1, pos.y, domino1);
                                        domino1 = insertData.domino1;
                                        domino2 = insertData.domino2;
                                } else { // pos.horiz, !domino1.horiz
                                        let nextDomino = dominoGrid.get(pos.x + 1, pos.y + 1);
                                        domino1.y += 1;
                                        domino1.horiz = true;
                                        dominoGrid.set(pos.x + 1, pos.y + 1, domino1);
                                        pos.x += 1;
                                        pos.horiz = false;
                                        domino1 = domino2;
                                        domino2 = nextDomino;
                                }
                        } else { // !pos.horiz
                                if (!domino1.horiz) {
                                        insertData = getColumnData(domino1.x + 1, domino1.n);
                                        pos = insertData.pos;
                                        domino1.x = pos.x;
                                        domino1.y = pos.y;
                                        dominoGrid.set(pos.x, pos.y, domino1);
                                        dominoGrid.set(pos.x, pos.y + 1, domino1);
                                        domino1 = insertData.domino1;
                                        domino2 = insertData.domino2;
                                } else { // !pos.horiz, domino1.horiz
                                        let nextDomino = dominoGrid.get(pos.x + 1, pos.y + 1);
                                        domino1.x += 1;
                                        domino1.horiz = false;
                                        dominoGrid.set(pos.x + 1, pos.y + 1, domino1);
                                        pos.y += 1;
                                        pos.horiz = true;
                                        domino1 = domino2;
                                        domino2 = nextDomino;
                                }
                        }
                }

                return pos;
        }

        removeRS(inputPosition) {
                if (!this.isExtremal(inputPosition)) {
                        throw new Error("Bad input to removeRS");
                }

                let dominoGrid = this.dominoGrid;

                function getInsertColumn(row, number, startColumn) {
                        for (let testColumn = startColumn + 1; ; ++testColumn) {
                                let testNumber = dominoGrid.getNumber(testColumn, row);
                                if (!testNumber || (testNumber > number)) {
                                        return testColumn - 1;
                                }
                        }
                }

                function getInsertRow(column, number, startRow) {
                        for (let testRow = startRow + 1; ; ++testRow) {
                                let testNumber = dominoGrid.getNumber(column, testRow);
                                if (!testNumber || (testNumber > number)) {
                                        return testRow - 1;
                                }
                        }
                }

                let domino1;
                let domino2;
                if (inputPosition.horiz) {
                        domino2 = dominoGrid.get(inputPosition.x + 1, inputPosition.y);
                        if (!domino2.horiz) {
                                domino1 = dominoGrid.get(inputPosition.x, inputPosition.y);
                        }
                } else { // !inputPosition.horiz
                        domino2 = dominoGrid.get(inputPosition.x, inputPosition.y + 1);
                        if (domino2.horiz) {
                                domino1 = dominoGrid.get(inputPosition.x, inputPosition.y);
                        }
                }

                dominoGrid.removeExtremal(inputPosition);

                let position = {x: inputPosition.x, y: inputPosition.y, horiz: inputPosition.horiz};
                while (true) {
                        if (position.horiz) {
                                if (position.y == 0) {
                                        break;
                                }

                                if (!domino2.horiz) {
                                        let nextDomino = dominoGrid.get(position.x, position.y - 1);
                                        domino2.x -= 1;
                                        domino2.horiz = true;
                                        dominoGrid.set(position.x, position.y - 1, domino2);
                                        position.y -= 1;
                                        position.horiz = false;
                                        domino2 = domino1;
                                        domino1 = nextDomino;
                                } else { // domino2. horiz
                                        let insertColumn = getInsertColumn(position.y - 1, domino2.n, position.x + 1);
                                        let movingDomino = domino2;
                                        position = {x: insertColumn - 1, y: position.y - 1, horiz: true};
                                        domino2 = dominoGrid.get(position.x + 1, position.y);
                                        if (!domino2.horiz) {
                                                domino1 = dominoGrid.get(position.x, position.y);
                                        }

                                        movingDomino.x = position.x;
                                        movingDomino.y = position.y;
                                        dominoGrid.set(position.x, position.y, movingDomino);
                                        dominoGrid.set(position.x + 1, position.y, movingDomino);
                                }
                        } else { // !position.horiz
                                if (position.x == 0) {
                                        break;
                                }

                                if (domino2.horiz) {
                                        let nextDomino = dominoGrid.get(position.x - 1, position.y);
                                        domino2.y -= 1;
                                        domino2.horiz = false;
                                        dominoGrid.set(position.x - 1, position.y, domino2);
                                        position.x -= 1;
                                        position.horiz = true;
                                        domino2 = domino1;
                                        domino1 = nextDomino;
                                } else { // domino2. horiz
                                        let insertRow = getInsertRow(position.x - 1, domino2.n, position.y + 1);
                                        let movingDomino = domino2;
                                        position = {x: position.x - 1, y: insertRow - 1, horiz:false};
                                        domino2 = dominoGrid.get(position.x, position.y + 1);
                                        if (domino2.horiz) {
                                                domino1 = dominoGrid.get(position.x, position.y);
                                        }

                                        movingDomino.x = position.x;
                                        movingDomino.y = position.y;
                                        dominoGrid.set(position.x, position.y, movingDomino);
                                        dominoGrid.set(position.x, position.y + 1, movingDomino);
                                }
                        }
                }

                let index = this.dominoList.indexOf(domino2);
                this.dominoList.splice(index, 1);
                let number = domino2.n;
                if (!domino2.horiz) {
                        number = -number;
                }

                return number;
        }

        //note, currently, domino is not in the first row or the first column
        flipDomino(domino) {
                let dgrid = this.dominoGrid;
                let x = domino.x;
                let y = domino.y;
                if (domino.horiz) {
                        domino.horiz = false;
                        dgrid.unset(x + 1, y);
                        dgrid.set(x, y + 1, domino);
                        // grid[y][x + 1] = undefined;
                        // grid[y + 1][x] = domino;
                } else { //!domino.horiz
                        domino.horiz = true;
                        dgrid.unset(x, y + 1);
                        dgrid.set(x + 1, y, domino);
                        // grid[y][x + 1] = domino;
                        // grid[y + 1][x] = undefined;
                }
        }

        flipDominoForCycle(domino) {
                let dgrid = this.dominoGrid;
                let x = domino.x;
                let y = domino.y;
                let fs = domino.getFixedSquare();
                if (domino.horiz) {
                        domino.horiz = false;
                        if (fs.x == x) {
                                // grid[y][x + 1] = undefined;
                                // TODO check if needed

                                // if (this.dominoGrid.rows == y + 1) {
                                //         grid.push(new Array(1));
                                //         this.dominoGrid.rows = y + 2;
                                // }
                                //
                                // grid[y + 1][x] = domino;

                                dgrid.set(x, y + 1, domino);
                        } else { // fs.x != x
                                domino.x = x + 1;
                                domino.y = y - 1;
                                dgrid.set(x + 1, y - 1, domino);
                                // grid[y - 1][x + 1] = domino;
                                // TODO shouldn't be needed
                                // grid[y][x] = undefined;
                        }
                } else { //!domino.horiz
                        domino.horiz = true;
                        if (fs.y == y) {
                                // grid[y + 1][x] = undefined;
                                dgrid.set(x + 1, y, domino);
                                // grid[y][x + 1] = domino;
                        } else { // fs.x != x
                                domino.x = x - 1;
                                domino.y = y + 1;
                                dgrid.set(x - 1, y + 1, domino);
                                // grid[y + 1][x - 1] = domino;
                                // TODO shouldn't be needed
                                // grid[y][x] = undefined;
                        }
                }
        }

        slideDominoForCycle(domino) {
                let dgrid = this.dominoGrid;
                let x = domino.x;
                let y = domino.y;
                let fs = domino.getFixedSquare();
                if (domino.horiz) {
                        if (fs.x == x) {
                                domino.x = x - 1;
                                dgrid.set(x - 1, y, domino);
                                // grid[y][x - 1] = domino;
                                // grid[y][x + 1] = undefined;
                        } else { // fs.x != x
                                domino.x = x + 1;
                                dgrid.set(x + 2, y, domino);
                                // grid[y][x + 2] = domino;
                                // TODO shouldn't be needed
                                // grid[y][x - 1] = undefined;
                        }
                } else { //!domino.horiz
                        if (fs.y == y) {
                                domino.y = y - 1;
                                dgrid.set(x, y - 1, domino);
                                // grid[y - 1][x] = domino;
                                // grid[y + 1][x] = undefined;
                        } else { // fs.x != x
                                domino.y = y + 1;
                                dgrid.set(x, y + 2, domino);
                                // // TODO check if needed
                                // if (this.dominoGrid.rows == y + 2) {
                                //         grid.push(new Array(1));
                                //         this.dominoGrid.rows = y + 3;
                                // }
                                //
                                // grid[y + 2][x] = domino;
                                // TODO shouldn't be needed
                                // grid[y][x] = undefined;
                        }
                }
        }

        flipDominos(domino1, domino2) {
                let x = domino1.x;
                let y = domino1.y;
                if (domino1.horiz && domino2.horiz && domino2.x == x && domino2.y == y + 1) {
                        domino1.horiz = false;
                        domino2.horiz = false;
                        domino2.x = x + 1;
                        domino2.y = y;
                } else if (!domino1.horiz && !domino2.horiz && domino2.x == x + 1  && domino2.y == y) {
                        domino1.horiz = true;
                        domino2.horiz = true;
                        domino2.x = x;
                        domino2.y = y + 1;
                } else {
                        throw new Error("Wrong configuration to flip.");
                }

                this.dominoGrid.addDomino(domino1);
                this.dominoGrid.addDomino(domino2);
        }

        flipDominosAlt(domino1, domino2) {
                let x = domino1.x;
                let y = domino1.y;
                if (domino1.horiz && domino2.horiz && domino2.x == x && domino2.y == y + 1) {
                        domino1.horiz = false;
                        domino2.horiz = false;
                        domino1.x = x + 1;
                        domino2.y = y;
                } else if (!domino1.horiz && !domino2.horiz && domino2.x == x + 1  && domino2.y == y) {
                        domino1.horiz = true;
                        domino2.horiz = true;
                        domino1.y = y + 1;
                        domino2.x = x;
                } else {
                        throw new Error("Wrong configuration to flip.");
                }

                this.dominoGrid.addDomino(domino1);
                this.dominoGrid.addDomino(domino2);
        }

        getForwardSquare(backSquare) {
                let grid = this.dominoGrid;
                let square = {x: backSquare.x, y:backSquare.y};
                let boxed = getGridSubPos(square) == "W";
                let domino = grid.get(square.x, square.y);
                do {
                        let fixedSquare = domino.getFixedSquare();
                        let x = fixedSquare.x;
                        let y = fixedSquare.y;
                        let gridPos = getGridSubPos(fixedSquare);
                        if ( (boxed && gridPos == "Y") || (!boxed && gridPos == "Z") ) {
                                let comp = y == 0 ? null : grid.get(x + 1, y - 1);
                                if (y == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x + 1;
                                        square.y = y;
                                        domino = grid.get(square.x, square.y);
                                        if (!domino) break;
                                } else {
                                        square.x = x;
                                        square.y = y - 1;
                                        domino = grid.get(square.x, square.y);
                                }
                        } else {
                                let comp = x == 0 ? null : grid.get(x - 1, y + 1);
                                if (x == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x;
                                        square.y = y + 1;
                                        domino = grid.get(square.x, square.y);
                                        if (!domino) break;
                                } else {
                                        square.x = x - 1;
                                        square.y = y;
                                        domino = grid.get(square.x, square.y);
                                }
                        }
                } while (true)

                return square;
        }

        getBackSquare(forwardSquare) {
                let grid = this.dominoGrid;
                let square = {x: forwardSquare.x, y:forwardSquare.y};
                let boxed = getGridSubPos(square) == "X";
                let domino;
                do {
                        let x = square.x;
                        let y = square.y;
                        let gridPos = getGridSubPos(square);
                        if ((boxed && gridPos == "X") || (!boxed && gridPos == "W" ) ) {
                                let choice1 = y == 0 ? null : grid.get(x, y - 1);
                                let choice2 = x == 0 ? null : grid.get(x - 1, y);
                                if (!choice1 && !choice2) {
                                        // case x ==0 && y == 0
                                } else if (!choice2 || (choice1 && (choice1.n > choice2.n))) {  //for later, case x or y equals 0
                                        domino = choice1;
                                        square = domino.getVariableSquare();
                                } else {
                                        domino = choice2;
                                        square = domino.getVariableSquare();
                                }
                        } else {
                                let choice1 = grid.get(x, y + 1);
                                let choice2 = grid.get(x + 1, y);
                                if (!choice1 && !choice2) {
                                        break;
                                } else if (!choice2 || (choice1 && (choice1.n < choice2.n))) {
                                        domino = choice1;
                                        square = domino.getVariableSquare();
                                } else {
                                        domino = choice2;
                                        square = domino.getVariableSquare();
                                }
                        }
                } while (true);

                return square;
        }

        moveOpenCycle(backSquare) {
                let movedDominos = [];
                let dgrid = this.dominoGrid;
                let square = {x: backSquare.x, y:backSquare.y};
                let boxed = getGridSubPos(square) == "W";
                let domino = dgrid.get(square.x, square.y);
                dgrid.unset(square.x, square.y);
                // dgrid.grid[square.y][square.x] = undefined;
                do {
                        let fixedSquare = domino.getFixedSquare();
                        let x = fixedSquare.x;
                        let y = fixedSquare.y;
                        let gridPos = getGridSubPos(fixedSquare);
                        if ( (boxed && gridPos == "Y") || (!boxed && gridPos == "Z") ) {
                                let comp = y == 0 ? null : dgrid.get(x + 1, y - 1);
                                if (y == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x + 1;
                                        square.y = y;
                                        let nextDomino = dgrid.get(square.x, square.y);
                                        if (domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                        if (!nextDomino) break;
                                        domino = nextDomino;
                                } else {
                                        square.x = x;
                                        square.y = y - 1;
                                        let nextDomino = dgrid.get(square.x, square.y);
                                        if (!domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                        domino = nextDomino;
                                }
                        } else {
                                let comp = x == 0 ? null : dgrid.get(x - 1, y + 1);
                                if (x == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x;
                                        square.y = y + 1;
                                        let nextDomino = dgrid.get(square.x, square.y);
                                        if (!domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                        if (!nextDomino) break;
                                        domino = nextDomino;
                                } else {
                                        square.x = x - 1;
                                        square.y = y;
                                        let nextDomino = dgrid.get(square.x, square.y);
                                        if (domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                        domino = nextDomino;
                                }
                        }
                } while (true)

                return {square: square, movedDominos: movedDominos};
        }

        moveOpenCycleToSquare(forwardSquare) {
                let movedDominos = [];
                let dgrid = this.dominoGrid;
                let square = {x: forwardSquare.x, y:forwardSquare.y};
                let boxed = getGridSubPos(square) == "X";
                let domino;
                do {
                        let x = square.x;
                        let y = square.y;
                        let gridPos = getGridSubPos(square);
                        if ((boxed && gridPos == "X") || (!boxed && gridPos == "W" ) ) {
                                let choice1 = y == 0 ? null : dgrid.get(x, y - 1);
                                let choice2 = x == 0 ? null : dgrid.get(x - 1, y);
                                if (!choice1 && !choice2) {
                                        // case x ==0 && y == 0
                                } else if (!choice2 || (choice1 && (choice1.n > choice2.n))) {  //for later, case x or y equals 0
                                        domino = choice1;
                                        square = domino.getVariableSquare();
                                        if (!domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                } else {
                                        domino = choice2;
                                        square = domino.getVariableSquare();
                                        if (domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                }
                        } else {
                                let choice1 = dgrid.get(x, y + 1);
                                let choice2 = dgrid.get(x + 1, y);
                                if (!choice1 && !choice2) {
                                        break;
                                } else if (!choice2 || (choice1 && (choice1.n < choice2.n))) {
                                        domino = choice1;
                                        square = domino.getVariableSquare();
                                        if (!domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                } else {
                                        domino = choice2;
                                        square = domino.getVariableSquare();
                                        if (domino.horiz) {
                                                this.slideDominoForCycle(domino);
                                        } else {
                                                this.flipDominoForCycle(domino);
                                        }

                                        movedDominos.push(domino);
                                }
                        }
                } while (true);

                if (square.x != forwardSquare.x) {
                        dgrid.unset(square.x, square.y);
                        // dgrid.grid[square.y][square.x] = undefined;
                }

                return movedDominos;
        }

}

class SignTableau{
        constructor(tableau) {
                if (!tableau) {
                        this.tableau = new Tableau([]);
                } else {
                        this.tableau = tableau;
                }
        }

        clone() {
                let tab = this.tableau.clone();
                return new SignTableau(tab);
        }

        static getExpectedSign(firstDomino, secondDomino, sign) {
                if (!sign) {
                        sign = firstDomino.n;
                }

                let ffs = firstDomino.getFixedSquare();
                let sfs = secondDomino.getFixedSquare();
                let columnDiffCount = (ffs.x - sfs.x) / 2;
                let expectedSign;
                if (columnDiffCount % 2 == 0) {
                        expectedSign = sign;
                } else {
                        expectedSign = oppositeSign(sign);
                }

                return expectedSign;
        }

        getCycleCase(bottomDomino, topDomino) {
                if (!topDomino) {
                        topDomino = this.getTopDomino(bottomDomino);
                } else if (!bottomDomino) {
                        bottomDomino = this.getBottomDomino(topDomino);
                }

                if (bottomDomino.n != "") {
                        if (topDomino.n == "") {
                                return "B";
                        }

                        if (topDomino.n == SignTableau.getExpectedSign(bottomDomino, topDomino)) {
                                return "A";
                        }

                        return "E";
                }

                // Henceforth bottomDomino.n == ""
                if (topDomino.n == "") {
                        if (this.getSign(topDomino.x - 1, topDomino.y) != "") {
                                return "F";
                        }

                        return "C";
                }

                return "D";
        }

        get(x, y) {
                return this.tableau.dominoGrid.get(x, y);
        }

        getSign(x, y) {
                let dom = this.get(x, y);
                if (dom.box) return "*";
                return dom.n;
        }

        getRowLength(i) {
                return this.tableau.dominoGrid.getRowLength(i);
        }

        getColumnLength(i) {
                return this.tableau.dominoGrid.getColumnLength(i);
        }

        putDomino(dominoData) {
                let domino = new Domino(dominoData);
                this.tableau.insertAtEnd(domino);
        }

        hasPairFor(domino) {
                let fs = domino.getFixedSquare();
                if (getGridSubPos(fs) != "Y") {
                        throw new Error ("This domino can't be paired.");
                }

                if (this.get(fs.x + 1, fs.y + 1)) {
                        return true;
                }

                return false;
        }

        isCycleTop(domino) {
                if (!domino.horiz) {
                        return false;
                }

                if (getGridSubPos(domino) != "X" || this.hasPairFor(domino)) {
                        throw new Error("Bad input to isCycleTop");
                }

                let adjacentDomino = this.get(domino.x - 1, domino.y);
                return this.hasPairFor(adjacentDomino);
        }

        isCycleBottom(domino) {
                if (domino.y == 0) {
                        return false;
                }

                let fixedSquare = domino.getFixedSquare();
                if (getGridSubPos(fixedSquare) != "Y" || this.hasPairFor(domino)) {
                        throw new Error("Bad input to isCycleTop");
                }

                let upperDomino = this.get(fixedSquare.x, fixedSquare.y - 1);
                return !upperDomino.box && !upperDomino.horiz && this.hasPairFor(upperDomino);
        }

        isTopCorner(domino) {
                if (getGridSubPos(domino) != "Y") {
                        throw new Error("Wrong Domino for isTopCorner");
                }

                if (domino.horiz) {
                        return false;
                }

                let rightDomino = this.get(domino.x + 1, domino.y);
                return rightDomino && rightDomino.horiz;
        }

        isTopCorner0(domino) {

                if (domino.horiz) {
                        return false;
                }

                if (domino.y == 0) {
                        return true;
                }

                let aboveDomino = this.get(domino.x, domino.y - 1);
                return aboveDomino.box || aboveDomino.horiz;
        }

        isBottomCorner(domino) {
                if (!domino.horiz) {
                        return false;
                }

                if(domino.y == 0) {
                        return false;
                }

                let aboveDomino = this.get(domino.x + 1, domino.y - 1);
                return !aboveDomino.box && !aboveDomino.horiz;
        }

        getBottomDomino(topDomino) {
                let x = topDomino.x;
                let y = topDomino.y;
                let currentColumn = x - 1;
                let currentDomino = this.get(currentColumn, y);
                while (true) {
                        if (!currentDomino.horiz) {
                                break;
                        }

                        currentColumn -= 2;
                        currentDomino = this.get(currentColumn, y);
                }

                let currentRow = y + 2;
                while (true) {
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        if (currentDomino.horiz) {
                                break;
                        }

                        currentRow += 2;
                }

                return this.getBottomDomino(currentDomino);
        }

        getTopDomino(bottomDomino) {
                let bfs = bottomDomino.getFixedSquare();
                let x = bfs.x;
                let y = bfs.y;
                let currentRow = y - 2;
                let currentDomino = this.get(x, currentRow);
                while (true) {
                        if (currentRow == 0) {
                                break;
                        }

                        currentRow -= 2;
                        let nextDomino = this.get(x, currentRow);
                        if (nextDomino.box || nextDomino.horiz) {
                                currentRow += 2;
                                break;
                        }

                        currentDomino = nextDomino;
                }

                // Note, this is not the column of the fixed square
                //currentRow -= 1;
                let currentColumn = x + 1;
                currentDomino = this.get(currentColumn, currentRow);
                while (true) {
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentColumn += 2;
                        let nextDomino = this.get(currentColumn, currentRow);
                        if (!nextDomino.horiz) {
                                break;
                        }

                        currentDomino = nextDomino;
                }

                return this.getTopDomino(currentDomino);
        }

        isBoxedInnerCycle(topDomino) {
                let innerDomino = this.get(topDomino.x, topDomino.y + 1);
                return innerDomino.isBoxed();
        }

        findSignInRowRight(row, startColumn) {
                // Note, these are the coordinates of a fixed square
                let currentColumn = startColumn;
                let currentDomino = this.get(currentColumn, row);
                while(true) {
                        let sign = currentDomino.n;
                        if (sign != "") {
                                return {sign: sign, column: currentColumn};
                        }

                        if (this.isBottomCorner(currentDomino)) {
                                return {sign: "", column: currentColumn};
                        }

                        currentColumn += 2;
                        currentDomino = this.get(currentColumn, row);

                        if (!currentDomino) {
                                return {sign: "", column: currentColumn - 2};
                        }
                }
        }

        findSignInRowLeft(row, startColumn) {
                // Note, these are the coordinates of a fixed square
                let currentColumn = startColumn;
                let currentDomino = this.get(currentColumn, row);
                while(true) {
                        let paired = this.hasPairFor(currentDomino);
                        let sign = paired ? "" : currentDomino.n;
                        if (sign != "" || !currentDomino.horiz || paired) {
                                return {sign: sign, column: currentColumn, horiz: currentDomino.horiz, paired: paired};
                        }

                        currentColumn -= 2;
                        currentDomino = this.get(currentColumn, row);
                }
        }

        findSignInColumnBelow(column, startRow) {
                // Note, these are the coordinates of a fixed square
                let currentRow = startRow;
                let currentDomino = this.get(column, currentRow);
                while(true) {
                        let sign = currentDomino.n;
                        if (sign != "") {
                                return {sign: sign, row: currentRow};
                        }

                        if (this.isBottomCorner(currentDomino)) {
                                return {sign: "", row: currentRow};
                        }

                        currentRow += 2;
                        currentDomino = this.get(column, currentRow);

                        if (!currentDomino) {
                                return {sign: "", row: currentRow - 2};
                        }
                }
        }

        findSignInColumnAbove(column, startRow) {
                // Note, these are the coordinates of a fixed square
                let currentRow = startRow;
                let currentDomino = this.get(column, currentRow);
                while(true) {
                        let paired = this.hasPairFor(currentDomino);
                        let sign = paired ? "" : currentDomino.n;
                        if (sign != "" || paired || this.isTopCorner0(currentDomino)) {
                                return {sign: sign, row: currentRow,  paired: paired};
                        }

                        currentRow -= 2;
                        currentDomino = this.get(column, currentRow);
                }
        }

        putSignsFromTop(topDomino, startSign) {
                let x = topDomino.x;
                let y = topDomino.y;
                let currentSign = startSign;
                let currentColumn = x - 1;
                let currentDomino = this.get(currentColumn, y);
                while (true) {
                        //TODO remove this unneeded condition
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = currentSign;
                        this.get(currentColumn + 1, y + 1).n = oppositeSign(currentSign);

                        if (!currentDomino.horiz) {
                                break;
                        }

                        currentSign = oppositeSign(currentSign);
                        currentColumn -= 2;
                        currentDomino = this.get(currentColumn, y);
                }

                let currentRow = y + 2;
                while (true) {
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = currentSign;
                        this.get(currentColumn + 1, currentRow + 1).n = oppositeSign(currentSign);

                        if (currentDomino.horiz) {
                                break;
                        }

                        currentRow += 2;
                }

                return this.putSignsFromTop(currentDomino, oppositeSign(currentSign));
        }

        putSignsFromBottom(bottomDomino, startSign) {
                let fs = bottomDomino.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let currentSign = startSign;
                let currentRow = y - 2;
                let currentDomino = this.get(x, currentRow);
                while (true) {
                        //TODO remove this unneeded condition
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = currentSign;
                        this.get(x + 1, currentRow + 1).n = oppositeSign(currentSign);

                        if (this.isTopCorner0(currentDomino)) {
                                break;
                        }

                        currentRow -= 2;
                        currentDomino = this.get(x, currentRow);
                }

                let currentColumn = x + 2;
                while (true) {
                        currentSign = oppositeSign(currentSign)
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = currentSign;
                        this.get(currentColumn + 1, currentRow + 1).n = oppositeSign(currentSign);

                        if (this.isBottomCorner(currentDomino)) {
                                break;
                        }

                        currentColumn += 2;
                }

                return this.putSignsFromBottom(currentDomino, currentSign);
        }

        putSignsFromBottomUnboxed(bottomDomino, startSign) {
                let fs = bottomDomino.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let currentSign = startSign;
                let currentRow = y - 2;
                let currentDomino = this.get(x, currentRow);
                while (true) {
                        currentDomino.n = currentSign;
                        this.get(x + 1, currentRow + 1).n = oppositeSign(currentSign);

                        if (currentDomino.horiz) {
                                break;
                        }

                        currentRow -= 2;
                        currentDomino = this.get(x, currentRow);
                }

                let currentColumn = x + 2;
                while (true) {
                        currentSign = oppositeSign(currentSign);
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = currentSign;
                        this.get(currentColumn + 1, currentRow + 1).n = oppositeSign(currentSign);

                        if (!currentDomino.horiz) {
                                break;
                        }

                        currentColumn += 2;
                }

                return this.putSignsFromBottomUnboxed(currentDomino, currentSign);
        }

        removeSignsFromTop(topDomino) {
                let x = topDomino.x;
                let y = topDomino.y;
                let currentColumn = x - 1;
                let currentDomino = this.get(currentColumn, y);
                while (true) {
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = "";
                        this.get(currentColumn + 1, y + 1).n = "";

                        if (!currentDomino.horiz) {
                                break;
                        }

                        currentColumn -= 2;
                        currentDomino = this.get(currentColumn, y);
                }

                let currentRow = y + 2;
                while (true) {
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = "";
                        this.get(currentColumn + 1, currentRow + 1).n = "";

                        if (currentDomino.horiz) {
                                break;
                        }

                        currentRow += 2;
                }

                return this.removeSignsFromTop(currentDomino);
        }

        removeSignsFromBottom(bottomDomino) {
                let fs = bottomDomino.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let currentRow = y - 2;
                let currentDomino = this.get(x, currentRow);
                while (true) {
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = "";
                        this.get(x + 1, currentRow + 1).n = "";

                        if (this.isTopCorner0(currentDomino)) {
                                break;
                        }

                        currentRow -= 2;
                        currentDomino = this.get(x, currentRow);
                }

                let currentColumn = x + 2;
                while (true) {
                        currentDomino = this.get(currentColumn, currentRow);
                        if (!this.hasPairFor(currentDomino)) {
                                return currentDomino;
                        }

                        currentDomino.n = "";
                        this.get(currentColumn + 1, currentRow + 1).n = "";

                        if (this.isBottomCorner(currentDomino)) {
                                break;
                        }

                        currentColumn += 2;
                }

                return this.removeSignsFromBottom(currentDomino);
        }

        moveInnerCycleFromTop(topDomino, down) {
                // If down == true, we are moving a boxed inner cycle down.
                let x = topDomino.x;
                let y = topDomino.y;
                let square = {x: x + 1, y: y + 1};
                if (down) {
                        this.moveCycleDownFromSquare(square);
                } else {
                        this.moveCycleUpToSquare(square, true);
                }
        }

        moveInnerCycleFromBottom(bottomDomino, down) {
                // If down == true, we are moving a boxed inner cycle down.
                let fs = bottomDomino.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let square = {x: x + 1, y: y};
                if (down) {
                        this.moveCycleDownToSquare(square, true);
                } else {
                        this.moveCycleUpFromSquare(square);
                }
        }

        // TODO not currently used, but maybe with refactoring
        flipCycle(domino, top) {
                // if top == true, then domino1 is the top domino of its cycle
                // otherwise, it's the bottom domino
                let topDomino;
                let bottomDomino;
                if (top) {
                        topDomino = domino;
                        bottomDomino = this.getBottomDomino(topDomino);
                } else {
                        bottomDomino = domino;
                        topDomino = this.getTopDomino(bottomDomino);
                }

                let cycleCase = this.getCycleCase(bottomDomino, topDomino);
                if (cycleCase == "E" || cycleCase == "F") {
                        throw new Error("Wrong cycle case for flipCycle: " + cycleCase);
                }

                let boxed = this.get(topDomino.x, topDomino.y + 1).isBoxed();
                this.moveInnerCycleFromTop(topDomino, boxed);
                if (cycleCase == "B") {
                        if (boxed) {
                                this.putSignsFromBottom(bottomDomino, bottomDomino.n);
                        } else {
                                this.removeSignsFromTop(topDomino);
                        }
                } else if (cycleCase == "D") {
                        if (boxed) {
                                this.removeSignsFromTop(topDomino);
                        } else {
                                this.putSignsFromTop(oppositeSign(topDomino.n));
                        }
                }

        }

        moveCycleUpFromSquare(square, domino) {
                let x = square.x;
                let y = square.y;
                if (!domino) {
                        domino = this.get(x, y);
                        this.tableau.dominoGrid.unset(x, y);
                } else {
                        let otherDomino = this.get(x, y);
                        // Note, I think this isn't true in any current code
                        if (SignTableau.sameDomino(domino, otherDomino)) {
                                console.log("Unexpected in moveCycleUpFromSquare");
                                this.tableau.dominoGrid.unset(x, y);
                        }
                }

                let currentDomino = domino;
                while (currentDomino) {
                        if (!currentDomino.horiz) {
                                if (this.isTopCorner0(currentDomino)) {
                                        x += 1;
                                        y -= 1;
                                        let nextDomino = this.get(x, y);
                                        this.tableau.flipDominoForCycle(currentDomino);
                                        currentDomino = nextDomino;
                                } else {
                                        y -= 2;
                                        let nextDomino = this.get(x, y);
                                        this.tableau.slideDominoForCycle(currentDomino);
                                        currentDomino = nextDomino;
                                }
                        } else { // currentDomino.horiz
                                if (this.isBottomCorner(currentDomino)) {
                                        x += 1;
                                        y -= 1;
                                        let nextDomino = this.get(x, y);
                                        this.tableau.flipDominoForCycle(currentDomino);
                                        currentDomino = nextDomino;
                                } else {
                                        x += 2;
                                        let nextDomino = this.get(x, y);
                                        this.tableau.slideDominoForCycle(currentDomino);
                                        currentDomino = nextDomino;
                                }
                        }
                }

                return {x: x, y: y};
        }

        moveCycleDownFromSquare(square, domino) {
                let x = square.x;
                let y = square.y;

                if (!domino) {
                        domino = this.get(x, y);
                        this.tableau.dominoGrid.unset(x, y);
                } else {
                        let otherDomino = this.get(x, y);
                        // Note, I think this isn't true in any current code
                        if (SignTableau.sameDomino(domino, otherDomino)) {
                                console.log("Unexpected in moveCycleDownFromSquare");
                                this.tableau.dominoGrid.unset(x, y);
                        }
                }

                let currentDomino = domino;
                while (true) {
                        let fs = currentDomino.getFixedSquare();
                        let adjacentDomino = this.get(fs.x - 1, fs.y);
                        if (adjacentDomino.horiz) { // move left
                                if (!currentDomino.horiz) {
                                        x -= 1;
                                        y += 1;
                                        this.tableau.flipDominoForCycle(currentDomino);
                                } else { // currentDomino.horiz
                                        x -= 2;
                                        this.tableau.slideDominoForCycle(currentDomino);
                                }

                                currentDomino = adjacentDomino;
                        } else { // move down
                                let nextDomino = this.get(fs.x, fs.y + 1);
                                if (!currentDomino.horiz) {
                                        y += 2;
                                        this.tableau.slideDominoForCycle(currentDomino);
                                } else { // currentDomino.horiz
                                        x -= 1;
                                        y += 1;
                                        this.tableau.flipDominoForCycle(currentDomino);
                                }

                                if (!nextDomino) {
                                        break;
                                }

                                currentDomino = nextDomino;
                        }

                }

                return {x: x, y: y};
        }

        moveCycleUpToSquare(square, lookLeft, endSquare) {
                let x = square.x;
                let y = square.y;
                while (true) {
                        if (lookLeft) {
                                let domino = this.get(x - 1, y);
                                if (!domino.horiz) {
                                        this.tableau.flipDominoForCycle(domino);
                                        x -= 1;
                                        y += 1;
                                        lookLeft = false;
                                } else {
                                        this.tableau.slideDominoForCycle(domino);
                                        x -= 2;
                                        if (endSquare && endSquare.x == x) {
                                                break;
                                        }
                                }
                        } else { // !lookLeft, so look Below
                                let domino = this.get(x, y + 1);
                                if (!domino) {
                                        break;
                                }

                                if (domino.horiz) {
                                        this.tableau.flipDominoForCycle(domino);
                                        x -= 1;
                                        y += 1;
                                        lookLeft = true;
                                } else {
                                        this.tableau.slideDominoForCycle(domino);
                                        y += 2;
                                }
                        }
                }

                this.tableau.dominoGrid.unset(x, y);
                return {x: x, y: y};
        }

        moveCycleDownToSquare(square, lookAbove, endSquare) {
                let x = square.x;
                let y = square.y;
                while (true) {
                        if (lookAbove) {
                                let domino = this.get(x, y - 1);
                                if (domino.horiz) {
                                        this.tableau.flipDominoForCycle(domino);
                                        x += 1;
                                        y -= 1;
                                        lookAbove = false;
                                } else {
                                        this.tableau.slideDominoForCycle(domino);
                                        y -= 2;
                                        if (endSquare && endSquare.y == y) {
                                                break;
                                        }
                                }
                        } else { // !lookAbove
                                let domino = this.get(x + 1, y);
                                if (!domino) {
                                        break;
                                }

                                if (!domino.horiz) {
                                        this.tableau.flipDominoForCycle(domino);
                                        x += 1;
                                        y -= 1;
                                        lookAbove = true;
                                } else {
                                        this.tableau.slideDominoForCycle(domino);
                                        x += 2;
                                }
                        }
                }

                this.tableau.dominoGrid.unset(x, y);
                return {x: x, y: y};
        }

        boxHelperRemoveFromList(domino) {
                let dominoList = this.tableau.dominoList;
                let index = dominoList.indexOf(domino);
                dominoList.splice(index, 1);
                // Not needed since the removed item is replaced in the grid
                // by subsequent code.
                //this.tableau.regenGrid();
        }

        putBox(x, y) {
                let domino1 = this.get(x, y);
                let domino2;
                if (domino1) {
                        if (domino1.box) {
                                let message = "Error in putBox.  There is a box here.";
                                throw new Error(message);
                        }

                        if (domino1.horiz) {
                                domino2 = this.get(x, y + 1);
                        } else {
                                domino2 = this.get(x + 1, y);
                        }
                }

                if (domino2) this.boxHelperRemoveFromList(domino2);
                if (domino1) this.boxHelperRemoveFromList(domino1);

                let boxDomino = new Domino({n: "*", x: x, y: y, box: true});
                this.tableau.insertAtEnd(boxDomino);
        }

        moveBoxUp(x, y) {
                if (x == 0 || y == 0) {
                        return;
                }

                let upperDomino = this.get(x - 1, y - 1);
                let sign = upperDomino.n;
                if (sign == "*") {
                        return;
                }

                let box = this.get(x, y);
                this.boxHelperRemoveFromList(box);
                if (upperDomino.horiz) {
                        let firstDomino = new Domino({n: "", x: x, y : y, horiz: false});
                        let secondDomino = new Domino({n: "", x: x + 1, y : y, horiz: false});
                        if (sign != "") {
                                firstDomino.n = sign;
                                secondDomino.n = oppositeSign(sign);
                        }

                        this.putDomino(firstDomino);
                        this.putDomino(secondDomino);
                        this.makeBox(firstDomino);
                } else {
                        let firstDomino = new Domino({n: "", x: x, y : y, horiz: true});
                        let secondDomino = new Domino({n: "", x: x, y : y + 1, horiz: true});
                        if (sign != "") {
                                firstDomino.n = sign;
                                secondDomino.n = oppositeSign(sign);
                        }

                        this.putDomino(firstDomino);
                        this.putDomino(secondDomino);
                        this.makeBox(firstDomino);
                }
        }

        premakeBox(pos) {
                let x = pos.x;
                let y = pos.y;
                let startDomino = this.get(x, y);
                let horiz = startDomino.horiz;
                if (horiz != pos.horiz) {
                        throw new Error("Bad input to premakeBox");
                }

                let gridPos = getGridSubPos(pos);
                if (gridPos == "X" && !horiz) {
                        this.putBox(x - 1, y);
                        return {x: x - 1, y: y, box: true};
                }

                if (gridPos == "Z" && horiz) {
                        let nextDomino = this.get(x, y - 1);
                        this.tableau.flipDominosAlt(nextDomino, startDomino);
                        return this.premakeBox(startDomino);
                }

                if (gridPos == "X" && horiz) {
                        let nextDomino = this.get(x, y - 1);
                        return this.premakeBox(nextDomino);
                }

                if (gridPos == "W" && !horiz) {
                        let nextDomino = this.get(x - 1, y);
                        this.tableau.flipDominos(nextDomino, startDomino);
                        return this.premakeBox(nextDomino);
                }

                if (gridPos == "Y" && horiz) {
                        let nextDomino = this.get(x, y - 1);
                        this.tableau.flipDominosAlt(nextDomino, startDomino);
                        return this.premakeBox(startDomino);
                }

                if (gridPos == "Y" && !horiz) {
                        let nextDomino = this.get(x - 1, y);
                        this.tableau.flipDominosAlt(nextDomino, startDomino);
                        return this.premakeBox(startDomino);
                }

        }

        makeBox(domino) {
                let box = this.premakeBox(domino);
                this.moveBoxUp(box.x, box.y);
        }

        moveBoxDown(x, y) {
                if (this.get(x, y).box) {
                        return;
                }

                this.moveBoxDown(x - 2, y - 2);
                let box = this.get(x - 2, y - 2);
                if (!box.box) {
                        throw new Error("Trouble in moveBoxDown");
                }

                this.boxHelperRemoveFromList(box);
                let dominoA = new Domino({n: "", x: x - 2, y: y - 2, horiz: false});
                let dominoB = new Domino({n: "", x: x - 1, y: y - 2, horiz: false});
                let sign = this.getSign(x - 2, y);
                if (sign != "") {
                        dominoA.n = sign;
                        dominoB.n = oppositeSign(sign);
                }

                this.tableau.insertAtEnd(dominoA);
                this.tableau.insertAtEnd(dominoB);
                let dominoC = this.get(x, y - 2);
                this.tableau.flipDominosAlt(dominoB, dominoC);
                let dominoD = this.get(x, y);
                let dominoE = this.get(x - 1, y + 1);
                if (dominoE.isBoxed()) {
                        this.tableau.flipDominosAlt(dominoD, dominoE);
                } else {
                        let dominoF = this.get(x + 1, y - 1);
                        this.tableau.flipDominos(dominoB, dominoD);
                        this.tableau.flipDominosAlt(dominoD, dominoF);
                }

                this.putBox(x, y);
        }

        unmakeBox(x, y, state) {
                this.moveBoxDown(x, y);
                let box = this.get(x, y);
                if (!box.box) {
                        throw new Error("Bad input to unmakeBox");
                }

                this.boxHelperRemoveFromList(box);
                let dominoA = new Domino({n: "", x: x, y: y, horiz: false});
                let dominoB = new Domino({n: "", x: x + 1, y: y, horiz: false});

                this.tableau.insertAtEnd(dominoA);
                this.tableau.insertAtEnd(dominoB);
                let dominoC = this.get(x + 2, y);

                this.tableau.flipDominosAlt(dominoB, dominoC);
                let dominoD = this.get(x + 2, y + 2);
                if (state == 2) {
                        let dominoE = this.get(x + 1, y + 3);
                        this.tableau.flipDominosAlt(dominoD, dominoE);
                } else if (state >= 3){
                        this.tableau.flipDominos(dominoB, dominoD);
                        if (state == 4) {
                                let dominoF = this.get(x + 3, y + 1);
                                this.tableau.flipDominosAlt(dominoD, dominoF);
                        }
                }
        }

        //TODO, unused, actually semi used now
        static sameDomino(domino1, domino2) {
                if (domino1.n != domino2.n) return false;
                if (domino1.x != domino2.x) return false;
                if (domino1.y != domino2.y) return false;
                if (domino1.n == "*") return true;
                if (domino1.horiz != domino2.horiz) return false;
                return true;
        }
}

class DualSignTableaux {
        constructor(tbl) {
                if (tbl) {
                        this.stab = tbl.stab;
                        this.dstab = tbl.dstab;
                } else {
                        this.stab = new SignTableau();
                        this.dstab = new SignTableau();
                }
        }

        clone() {
                let tbl = { stab: this.stab.clone(), dstab: this.dstab.clone()};
                return new DualSignTableaux(tbl);
        }

        // TODO check where these three functions are used
        moveSign(signedDomino1, blankDomino1) {
                let sign = signedDomino1.n;

                if (sign == "" || blankDomino1.n != "") {
                        throw new Error("Wrong input to moveSign");
                }

                let stab1;
                let stab2;
                if (sign == "+" || sign == "-") {
                        stab1 = this.stab;
                        stab2 = this.dstab;
                } else {
                        stab1 = this.dstab;
                        stab2 = this.stab;
                }

                let signedFixedSquare = signedDomino1.getFixedSquare();
                let blankFixedSquare = blankDomino1.getFixedSquare();
                let blankDomino2 = stab2.get(signedFixedSquare.y, signedFixedSquare.x);
                let signedDomino2 = stab2.get(blankFixedSquare.y, blankFixedSquare.x);
                blankDomino1.n = signedDomino1.n;
                signedDomino1.n = "";
                blankDomino2.n = signedDomino2.n;
                signedDomino2.n = "";
        }

        // Not used
        moveSignUpColumn(sign, bottomRow, topRow, column) {
                let stab1;
                let stab2;
                if (sign == "+" || sign == "-") {
                        stab1 = this.stab;
                        stab2 = this.dstab;
                } else {
                        stab1 = this.dstab;
                        stab2 = this.stab;
                }

                let signedDomino = stab1.get(column, bottomRow);
                let currentRow = bottomRow - 2;
                let blankDomino;
                while (currentRow >= topRow) {
                        blankDomino = stab1.get(column, currentRow);
                        this.moveSign(signedDomino, blankDomino);
                        signedDomino = blankDomino;
                        currentRow -= 2;
                }
        }

        moveSignDownColumn(sign, topRow, bottomRow, column) {
                let stab1;
                let stab2;
                if (sign == "+" || sign == "-") {
                        stab1 = this.stab;
                        stab2 = this.dstab;
                } else {
                        stab1 = this.dstab;
                        stab2 = this.stab;
                }

                let signedDomino = stab1.get(column, topRow);
                let currentRow = topRow + 2;
                let blankDomino;
                while (currentRow <= bottomRow) {
                        blankDomino = stab1.get(column, currentRow);
                        this.moveSign(signedDomino, blankDomino);
                        signedDomino = blankDomino;
                        currentRow += 2;
                }
        }

}

class DualTableaux {
        constructor(tbl) {
                if (tbl) {
                        this.tab = tbl.tab;
                        this.dtab = tbl.dtab;
                } else {
                        this.tab = new Tableau([]);
                        this.dtab = new Tableau([]);
                }
        }

        clone() {
                let tbl = {tab: this.tab.clone(), dtab: this.dtab.clone()};
                return new DualTableaux(tbl);
        }

        addRS(rsNumber) {
                let pos = this.tab.nextRS(rsNumber);
                let dpos = this.dtab.nextRS(-rsNumber);
                return {pos: pos, dpos: dpos};
        }
}

class Tableaux {
        constructor(tbl) {
                if (tbl) {
                        this.dualTabs = tbl.dualTabs;
                        this.dualSignTabs = tbl.dualSignTabs;
                } else {
                        this.dualTabs = new DualTableaux()
                        this.dualSignTabs = new DualSignTableaux();
                }
        }

        clone() {
                let tbl = {dualTabs: this.dualTabs.clone(), dualSignTabs: this.dualSignTabs.clone()};
                return new Tableaux(tbl);
        }

        draw() {
                let tabPair1 = new TableauPair(this.dualTabs.tab, this.dualSignTabs.stab.tableau);
                let tabPair2 = new TableauPair(this.dualTabs.dtab, this.dualSignTabs.dstab.tableau);
                let tabPairList = [tabPair1, tabPair2];
                document.body.appendChild(new TableauPairListRendererDOM(tabPairList).renderDOM());
        }

        putSignInCycleTop(topDomino1, sign1, sign2, noTab) {
                if (!sign2 && topDomino1.n != "") {
                        throw new Error("This cycle has a sign on top.");
                }

                let stab1;
                let stab2;
                let tab1;
                let tab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                        tab1 = this.dualTabs.tab;
                        tab2 = this.dualTabs.dtab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                        tab1 = this.dualTabs.dtab;
                        tab2 = this.dualTabs.tab;
                }

                let shapeChange = false;
                let opSign1 = oppositeSign(sign1);
                let bottomDomino1 = stab1.getBottomDomino(topDomino1);
                let tfs1 = topDomino1.getFixedSquare();
                let bfs1 = bottomDomino1.getFixedSquare();
                let topDomino2 = stab2.get(bfs1.y, bfs1.x);
                let bottomDomino2 = stab2.get(tfs1.y, tfs1.x);
                if (!sign2) {
                        sign2 = bottomDomino2.n;
                }

                let opSign2 = oppositeSign(sign2);
                let boxed = stab1.isBoxedInnerCycle(topDomino1);
                let adjacentSign1 = stab1.getSign(tfs1.x - 2, tfs1.y);
                let bottomSign1 = bottomDomino1.n;
                let expectedBottomSign1 = SignTableau.getExpectedSign(topDomino1, bottomDomino1, sign1);

                if (adjacentSign1 == "" && bottomSign1 == "" && boxed) {
                        stab1.putSignsFromTop(topDomino1, opSign1);
                        stab2.removeSignsFromBottom(bottomDomino2);
                } else if (adjacentSign1 == "" && bottomSign1 == "" && !boxed) {

                } else if (adjacentSign1 == "" && bottomSign1 == expectedBottomSign1 && boxed) {
                        stab1.putSignsFromTop(topDomino1, opSign1);
                        stab2.removeSignsFromBottom(bottomDomino2);
                } else if (bottomSign1 == expectedBottomSign1 && !boxed) {

                } else if (adjacentSign1 == opSign1 && bottomSign1 == "" && !boxed) {
                        stab1.removeSignsFromTop(topDomino1);
                        stab2.putSignsFromBottom(bottomDomino2, opSign2);
                } else if (adjacentSign1 == sign1 && bottomSign1 == "" && !boxed) {
                        stab1.putSignsFromTop(topDomino1, opSign1);
                        stab1.moveInnerCycleFromTop(topDomino1, false);
                        stab2.moveInnerCycleFromBottom(bottomDomino2, true);
                        if (!noTab) {
                                tab1.moveOpenCycle({x: bfs1.x + 1, y: bfs1.y});
                                tab2.moveOpenCycle({x: bfs1.y, y: bfs1.x + 1});
                        }

                        shapeChange = true;
                } else if (adjacentSign1 == "" && bottomSign1 != expectedBottomSign1 && boxed) {

                } else if (bottomSign1 == oppositeSign(expectedBottomSign1) && !boxed) {
                        stab1.removeSignsFromTop(topDomino1);
                        stab2.putSignsFromBottom(bottomDomino2, opSign2);
                        stab1.moveInnerCycleFromTop(topDomino1, false);
                        stab2.moveInnerCycleFromBottom(bottomDomino2, true);
                        if (!noTab) {
                                tab1.moveOpenCycle({x: bfs1.x + 1, y: bfs1.y});
                                tab2.moveOpenCycle({x: bfs1.y, y: bfs1.x + 1});
                        }

                        shapeChange = true;
                }

                return shapeChange;
        }

        putSignInCycleBottom(bottomDomino1, sign1, sign2, noTab) {
                if (!sign2 && bottomDomino1.n != "") {
                        throw new Error("This cycle has a sign on top.");
                }

                let stab1;
                let stab2;
                let tab1;
                let tab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                        tab1 = this.dualTabs.tab;
                        tab2 = this.dualTabs.dtab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                        tab1 = this.dualTabs.dtab;
                        tab2 = this.dualTabs.tab;
                }

                let shapeChange = false;
                let bfs1 = bottomDomino1.getFixedSquare();
                let topDomino2 = stab2.get(bfs1.y, bfs1.x);
                let bottomDomino2 = stab2.getBottomDomino(topDomino2);
                let topDomino1 = stab1.get(bottomDomino2.getFixedSquare().y, bottomDomino2.getFixedSquare().x);
                let tfs1 = topDomino1.getFixedSquare();
                if (!sign2) {
                        sign2 = topDomino2.n;
                }

                let opSign1 = oppositeSign(sign1);
                let opSign2 = oppositeSign(sign2);
                let boxed = stab1.isBoxedInnerCycle(topDomino1);
                // aboveSign1 is right above bottomDomino1
                let aboveSign1 = stab1.getSign(bfs1.x, bfs1.y - 1);
                let topSign1 = topDomino1.n;
                let expectedTopSign1 = SignTableau.getExpectedSign(bottomDomino1, topDomino1, sign1);

                let opExpectedTopSign1 = oppositeSign(expectedTopSign1);

                if (aboveSign1 == "" && topSign1 == expectedTopSign1 && !boxed) {
                        stab1.putSignsFromBottom(bottomDomino1, sign1);
                        stab2.removeSignsFromTop(topDomino2);
                } else if (aboveSign1 == sign1 && topSign1 == expectedTopSign1 && boxed) {

                } else if (aboveSign1 == opSign1 && topSign1 == opExpectedTopSign1 && boxed) {
                        stab1.removeSignsFromBottom(bottomDomino1);
                        stab2.putSignsFromTop(topDomino2, opSign2);
                } else if (aboveSign1 == "" && topSign1 == opExpectedTopSign1 && !boxed) {
                        stab2.putSignsFromTop(topDomino2, sign2);
                        stab1.moveInnerCycleFromBottom(bottomDomino1, false);
                        stab2.moveInnerCycleFromTop(topDomino2, true);
                        if (!noTab) {
                                tab1.moveOpenCycleToSquare({x: tfs1.x, y: tfs1.y + 1});
                                tab2.moveOpenCycleToSquare({x: tfs1.y + 1, y: tfs1.x});
                        }
                        shapeChange = true;
                } else if (aboveSign1 == "" && topSign1 == "" && !boxed) {
                        stab1.putSignsFromBottom(bottomDomino1, sign1);
                        stab2.removeSignsFromTop(topDomino2);
                } else if (aboveSign1 == "" && topSign1 == "" && boxed) {

                } else if (aboveSign1 == sign1 && topSign1 == "" && !boxed) {

                } else if (aboveSign1 == opSign1 && topSign1 == "" && !boxed) {
                        stab1.removeSignsFromBottom(bottomDomino1);
                        stab2.putSignsFromTop(topDomino2, sign2);
                        stab1.moveInnerCycleFromBottom(bottomDomino1, false);
                        stab2.moveInnerCycleFromTop(topDomino2, true);
                        if (!noTab) {
                                tab1.moveOpenCycleToSquare({x: tfs1.x, y: tfs1.y + 1});
                                tab2.moveOpenCycleToSquare({x: tfs1.y + 1, y: tfs1.x});
                        }
                        shapeChange = true;
                } else if (aboveSign1 == "" && topSign1 != "" && boxed) {
                        throw new Error("Defective nested cycle");
                }

                return shapeChange;
        }

        // Moves sign1 left in the row to domino1
        switchInRow(domino1, sign1, noTab) {
                if (!noTab) {
                        noTab = false;
                }

                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let fs = domino1.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let sign2 = stab2.getSign(y, x);
                let signData = stab1.findSignInRowRight(y, x + 2);
                if (signData.sign != sign1) {
                        throw new Error("Wrong input to switchInRow");
                }

                let column1 = signData.column;
                let secondDomino1 = stab1.get(column1, y);
                if (stab1.isBottomCorner(secondDomino1)) {
                        if (stab1.isCycleBottom(secondDomino1)) {
                                let secondDomino2 = stab2.get(y, column1);
                                this.putSignInCycleTop(secondDomino2, sign2);
                        } else {
                                let rowSignData2 = stab2.findSignInRowLeft(column1, y - 2);
                                if (rowSignData2.sign == sign2) {
                                        let thirdDomino1 = stab1.get(column1, rowSignData2.column);
                                        if (!stab1.isTopCorner(thirdDomino1)) {
                                                throw new Error("Trouble in switchInRow");
                                        }

                                        this.switchInRow(thirdDomino1, sign1);
                                }
                        }
                }

                let shapeChange = false;
                if (stab1.isCycleTop(domino1)) {
                        shapeChange = this.putSignInCycleTop(domino1, sign1, sign2, noTab);
                }

                this.dualSignTabs.moveSign(secondDomino1, domino1);
                return shapeChange;
        }

        // moves sign1 down in the column, to domino1
        // note, refactor to accept a column number?
        switchInColumn(domino1, sign1) {
                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let fs = domino1.getFixedSquare();
                let x = fs.x;
                let y = fs.y;
                let signData = stab1.findSignInColumnAbove(x, y - 2);
                if (signData.sign != sign1) {
                        throw new Error("Wrong input to switchInColumn");
                }

                let row1 = signData.row;
                let secondDomino1 = stab1.get(x, row1);
                let sign2 = stab2.getSign(row1 + 2, x);
                if (!stab1.isTopCorner(secondDomino1)) {
                        if (stab1.isCycleBottom(secondDomino1)) {
                                let secondDomino2 = stab2.get(row1, x);
                                let sign2 = stab2.getSign(row1 + 2, x);
                                this.putSignInCycleTop(secondDomino2, sign2);
                        }

                } else {
                        signData = stab2.findSignInColumnBelow(row1, x + 2);
                        if (signData.sign == oppositeSign(sign2)) {
                                let thirdDomino1 = stab1.get(signData.row, row1);
                                if (!stab1.isBottomCorner(thirdDomino1)) {
                                        throw new Error("Trouble in switchInColumn");
                                }

                                let newSign1 = stab1.getSign(signData.row - 2, row1);
                                this.switchInColumn(thirdDomino1, oppositeSign(newSign1));
                        }
                }

                if (stab1.isCycleTop(domino1)) {
                        this.putSignInCycleTop(domino1, sign1);
                }

                this.dualSignTabs.moveSignDownColumn(sign1, row1, fs.y, fs.x);
        }

        switchSignDown(domino1) {
                // domino1 is vertical, and a top corner
                let sign1 = domino1.n;
                if (sign1 == "" || domino1.horiz) {
                        throw new Error("Bad input to switchSignDown");
                }

                let x = domino1.x;
                let y = domino1.y;
                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let signData = stab2.findSignInRowRight(x, y + 2);
                let sign2 = signData.sign;
                if (sign2 == "") {
                        throw new Error("Bad input to switchSignDown");
                }

                let domino2 = stab2.get(y, x);
                return this.switchInRow(domino2, sign2);
        }

        switchSignLeft(domino1) {
                // domino1 is horizontal, and a bottom corner
                let sign1 = domino1.n;
                if (sign1 == "" || !domino1.horiz) {
                        throw new Error("Bad input to switchSignLeft");
                }

                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let x = domino1.x;
                let y = domino1.y;
                let signData = stab2.findSignInColumnAbove(y, x - 1);
                let sign2 = signData.sign;
                if (sign2 == "") {
                        throw new Error("Bad input to switchSignLeft");
                }

                let domino2 = stab2.get(y, x + 1);
                return this.switchInColumn(domino2, sign2);
        }

        makeSpaceFor(domino1, sign1) {
                if (!sign1) {
                        sign1 = domino1.n;
                }

                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let x = domino1.x;
                let y = domino1.y;

                if (domino1.horiz) {
                        let signData = stab1.findSignInRowLeft(y, x - 1);
                        if (signData.sign == sign1) {
                                let leftDomino1 = stab1.get(signData.column, y);
                                if (!stab1.isTopCorner(leftDomino1)) {
                                        throw new Error("Trouble in makeSpaceFor");
                                }

                                this.switchSignDown(leftDomino1);
                        }
                } else { // !domino1.horiz
                        if (stab1.getColumnLength(x) == y + 2) {
                                return;
                        }

                        let signData = stab1.findSignInColumnBelow(x, y + 2);
                        if (signData.sign == oppositeSign(sign1)) {
                                let belowDomino1 = stab1.get(x, signData.row);
                                if (!stab1.isBottomCorner(belowDomino1)) {
                                        throw new Error("Trouble in makeSpaceFor");
                                }

                                this.switchSignLeft(belowDomino1);
                        }
                }
        }

        prepareForSign(domino1, sign1) {
                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                if (domino1.horiz) {
                        if (stab1.isCycleTop(domino1)) {
                                this.putSignInCycleTop(domino1, sign1);
                        } else {
                                this.makeSpaceFor(domino1, sign1);
                        }
                }
        }

        switchAfterAddX(domino1) {
                let sign1 = domino1.n;
                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                if (!stab1.isBottomCorner(domino1)) {
                        throw new Error ("Bad input to switchAfterAddX");
                }

                // the fixed square in domino1
                let x = domino1.x + 1;
                let y = domino1.y;

                let dualTopSign = stab2.getSign(y - 2, x);
                let dualAdjacentSignData = stab2.findSignInColumnAbove(y, x - 2);
                if (dualAdjacentSignData.sign == oppositeSign(dualTopSign)) {
                        return;
                }

                this.switchAfterAddZ(domino1);
        }

        switchAfterAddZ(domino1, put) {
                let sign1 = domino1.n;
                let stab1;
                let stab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                if (!stab1.isBottomCorner(domino1)) {
                        throw new Error ("Bad input to switchAfterAddZ");
                }

                // the fixed square in domino1
                let x = domino1.x + 1;
                let y = domino1.y;

                let domino2 = stab2.get(y, x);
                let signData = stab2.findSignInRowLeft(x, y - 2);
                // check this for style later
                let sign2 = signData.sign;
                if (sign2 == "") {
                        return;
                }

                let rightDomino2 = domino2;
                let leftDomino2 = stab2.get(signData.column, x);
                if (put && leftDomino2.horiz) {
                        this.putSignInCycleBottom(domino2, sign2);
                }

                while (leftDomino2.horiz) {
                        let checkCycleTop = stab2.isCycleTop(leftDomino2);
                        if (checkCycleTop) {
                                this.putSignInCycleBottom(stab1.get(leftDomino2.y, leftDomino2.x + 1), sign1);
                        }

                        this.dualSignTabs.moveSign(leftDomino2, rightDomino2);
                        if (checkCycleTop) {
                                return;
                        }

                        rightDomino2 = leftDomino2;
                        leftDomino2 = stab2.get(leftDomino2.x - 1, x);
                        if (leftDomino2.n == "") {
                                return;
                        }


                }

                // now !leftDomino2.horiz
                // However, there might be nothing below leftDomino2
                let rowSignData1;
                if (stab1.getRowLength(leftDomino2.x) > x + 1) {
                        rowSignData1 = stab1.findSignInRowRight(leftDomino2.x, x + 2);
                        if (rowSignData1.sign == sign1) {
                                return;
                        }
                }

                // In this case, leftDomino2 is still the original leftDomino2,
                // adjacent to domino2.
                if (put && domino2.n == "") {
                        this.putSignInCycleBottom(domino2, sign2);
                }

                this.dualSignTabs.moveSign(leftDomino2, rightDomino2);

                if (!rowSignData1) {
                        return;
                }

                // If the row has no blanks in it,
                // and the last domino in it is a bottom corner,
                // it may be possible to move that domino up.
                let colSignData2 = stab2.findSignInColumnBelow(leftDomino2.x, x + 2);
                if (colSignData2.sign == "") {
                        let newDomino1 = stab1.get(colSignData2.row, leftDomino2.x);
                        if (stab1.isBottomCorner(newDomino1)) {
                                this.switchAfterAddZ(newDomino1);
                        }
                }
        }

        changeBoxSigns(pos, sign1) {
                  let stab1;
                  let stab2;
                  let tab1;
                  let tab2;
                  if (sign1 == "+" || sign1 == "-") {
                          stab1 = this.dualSignTabs.stab;
                          stab2 = this.dualSignTabs.dstab;
                          tab1 = this.dualTabs.tab;
                          tab2 = this.dualTabs.dtab;
                  } else {
                          stab1 = this.dualSignTabs.dstab;
                          stab2 = this.dualSignTabs.stab;
                          tab1 = this.dualTabs.dtab;
                          tab2 = this.dualTabs.tab;
                  }

                  // These are the coordinates of the top left square
                  let x = pos.x - 1;
                  let y = pos.y - 2;
                  //let opSign1 = oppositeSign(sign1);
                  let topDomino1 = stab1.get(x + 2, y);
                  let sideDomino1 = stab1.get(x, y + 2);
                  let lastDomino1 = stab1.get(x + 2, y + 2);
                  let sideDomino2 = stab2.get(y, x + 2);
                  let lastDomino2 = stab2.get(y + 2, x + 2);

                  if (topDomino1.n != sign1) {
                          throw new Error("Wrong input to changeBoxSigns");
                  }

                  let sign2 = stab2.getSign(y + 1, x + 1);
                  let opSign2 = oppositeSign(sign2);
                   // this.rotateSigns(sign1, x, y, false);
                  if (stab2.isCycleTop(sideDomino2)) {
                          this.putSignInCycleTop(sideDomino2, sign2);
                  } else {
                        this.makeSpaceFor(sideDomino2, sign2);
                  }

                  topDomino1.n = "";
                  lastDomino1.n = "";
                  sideDomino2.n = sign2;
                  lastDomino2.n = opSign2;

                  stab1.makeBox(lastDomino1);
                  stab2.makeBox(lastDomino2);

                  this.switchAfterAddZ(lastDomino2);
          }

        findRowAddSignX(sign1, x, y, noTab) {
                 if (!noTab) {
                         noTab = false;
                 }

                 let stab1;
                 let stab2;
                 let tab1;
                 let tab2;
                 if (sign1 == "+" || sign1 == "-") {
                         stab1 = this.dualSignTabs.stab;
                         stab2 = this.dualSignTabs.dstab;
                         tab1 = this.dualTabs.tab;
                         tab2 = this.dualTabs.dtab;
                 } else {
                         stab1 = this.dualSignTabs.dstab;
                         stab2 = this.dualSignTabs.stab;
                         tab1 = this.dualTabs.dtab;
                         tab2 = this.dualTabs.tab;
                 }

                 let opSign1 = oppositeSign(sign1);
                 let adjacentDomino1 = stab1.get(x - 1, y);
                 if (adjacentDomino1.n == oppositeSign(sign1)) {
                         return y;
                 }

                 if (!adjacentDomino1.horiz && adjacentDomino1.n == "") {
                         return y;
                 }

                 if (adjacentDomino1.horiz && adjacentDomino1.n == sign1) {
                         let nextRowLength = stab1.getRowLength(y + 1);
                         if (nextRowLength == x) {
                                 return y + 2;
                         }

                         if (nextRowLength == x - 1 && stab1.getRowLength(y + 2) < x - 1) {
                                 return y + 2;
                         }

                         return y + 1;
                 }

                 if (adjacentDomino1.horiz && adjacentDomino1.n == "") {
                         this.makeSpaceFor(adjacentDomino1, sign1);
                         return y;
                 }

                 // Henceforth, !adjacentDomino1.horiz, adjacentDomino1.n == sign1;
                 let rowSignData2 = stab2.findSignInRowRight(x - 1, y);
                 if (rowSignData2.sign != "") {
                         let shapeChange = this.switchInRow(stab2.get(y, x - 1), rowSignData2.sign, noTab);
                         return shapeChange ? -1: y;
                 }

                 // rowSignData2.sign == ""
                 // The column is full of sign1
                 return stab1.getColumnLength(x - 1);
         }

        findRowAddSignZ(sign1, x, y) {
                let stab1;
                let stab2;
                let tab1;
                let tab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                        tab1 = this.dualTabs.tab;
                        tab2 = this.dualTabs.dtab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                        tab1 = this.dualTabs.dtab;
                        tab2 = this.dualTabs.tab;
                }

                let opSign1 = oppositeSign(sign1);
                //Note, currently, this function is only called when !pairDomino1.horiz
                let pairDomino1 = stab1.get(x - 1, y - 1);

                if (pairDomino1.n == opSign1) {
                        return y;
                }

                // Henceforth, !pairDomino1.horiz, pairDomino1.n != opSign.
                if (pairDomino1.n == sign1) {
                        if (stab1.getRowLength(y + 1) < x) {
                                return y + 1;
                        }

                        let rowSignData2 = stab2.findSignInRowRight(x - 1, y + 1);
                        if (rowSignData2.sign == "") {
                                return stab1.getColumnLength(x - 1);
                        }

                        let pairDomino2 = stab2.get(y - 1, x - 1);
                        let sign2 = rowSignData2.sign;
                        this.makeSpaceFor(pairDomino2, sign2);
                        let foundDomino1 = stab1.get(x - 1, rowSignData2.column);
                        let foundDomino2 = stab2.get(rowSignData2.column, x - 1);
                        if (foundDomino1.horiz) {
                                if (stab1.isCycleTop(foundDomino1)) {
                                        this.putSignInCycleTop(foundDomino1, sign1);
                                } else {
                                        this.makeSpaceFor(foundDomino1, sign1);
                                }
                        }

                        pairDomino1.n = "";
                        pairDomino2.n = sign2;
                        foundDomino1.n = sign1;
                        foundDomino2.n = "";
                }

                // at this point, !pairDomino1.horiz and pairDomino1.n == ""
                let rowSignData = stab1.findSignInRowRight(y - 1, x + 1);
                if (rowSignData.sign != sign1) {
                        return y;
                }

                // henceforth, rowSignData.sign == sign
                if (stab1.getRowLength(y + 1) < x) {
                        return y + 1;
                }

                // henceforth, pairDomino1.n = "" and stab1.getRowLength(y + 1) == x
                // Again, no shape change is possible
                let rowAddSign = this.findRowAddSignX(sign1, x, y + 1);
                if (rowAddSign != y + 1) {
                        return rowAddSign;
                }

                // opSign is available in the x - 1 column, either as an opSign domino,
                // or as two blank dominos.
                // If there is an opSign domino in the column,
                // then it is in a bottom corner.
                // We need to find it and move it left,
                // since we will be putting sign into a domino in the column.
                let colSignData1 = stab1.findSignInColumnBelow(x - 1, y + 1);
                if (colSignData1.sign == opSign1) {
                        this.switchSignLeft(stab1.get(x - 1, colSignData1.row));
                }

                return y;
        }

        addNumberSign(number, sign1, y) {
                let stab1;
                let stab2;
                let tab1;
                let tab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                        tab1 = this.dualTabs.tab;
                        tab2 = this.dualTabs.dtab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                        tab1 = this.dualTabs.dtab;
                        tab2 = this.dualTabs.tab;
                }

                let domino1;
                let domino2;
                let x = stab1.getRowLength(y);
                let gridPos = getGridSubPos({x: x, y: y});

                // TODO fix this case for when boxing over the funny case
                if (gridPos == "X") {
                        let rowAddSign = this.findRowAddSignX(sign1, x, y);
                        if (rowAddSign > y) {
                                return this.addNumberSign(number, sign1, rowAddSign);
                        }

                        let upperLeft = y == 0 ? null : stab1.get(x - 1, y - 1);
                        let upperRight = y == 0 ? null : stab1.get(x + 1, y - 1);

                        // extend up cycle
                        if (y == 0 || (upperRight && (upperRight.n == "*" || (upperLeft.horiz && stab1.getRowLength(y - 1) > x + 2)))) {
                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                stab1.putDomino(domino1);
                                domino2 = {n: "", x: y, y: x + 1, horiz: false};
                                stab2.putDomino(domino2);
                        }

                        // contract down cycle
                        else if (stab1.getRowLength(y - 1) > x + 2) {
                                let adjacentDomino1 = stab1.get(x - 1, y);
                                if (adjacentDomino1.n == "") {
                                        this.putSignInCycleBottom(adjacentDomino1, oppositeSign(sign1));
                                }

                                if (rowAddSign == -1) { // shape change
                                        domino1 = {n: sign1, x: x + 1, y: y, horiz: true};
                                        domino2 = {n: "", x: y, y: x + 1, horiz: false};
                                } else {
                                        domino1 = {n: sign1, x: x, y: y, horiz: true};
                                        domino2 = {n: "", x: y, y: x, horiz: false};
                                }

                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);

                                stab1.makeBox(domino1);
                                stab2.makeBox(domino2);
                        }

                        // Henceforth stab1.getRowLength(y - 1) == x + 2, (unless shape change?)
                        // connect two up cycles
                        else if (upperLeft.n == "*" || (upperLeft.horiz && upperRight && !upperRight.horiz) ) {
                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                stab1.putDomino(domino1);
                                domino2 = {n: "", x: y - 1, y: x + 1, horiz: true};
                                stab2.putDomino(domino2);
                        }

                        // close down cycle.
                        else if ((rowAddSign == - 1 && stab1.getRowLength(y - 1) == x + 1) || (stab1.get(x, y - 1).horiz && !stab1.get(x - 1, y - 1).horiz)) { // close down cycle
                                if (rowAddSign == -1) { // shape change
                                        domino1 = {n: sign1, x: x + 1, y: y - 1, horiz: false};
                                        domino2 = {n: "", x: y - 1, y: x + 1, horiz: true};
                                } else {
                                        domino1 = {n: sign1, x: x, y: y, horiz: true};
                                        domino2 = {n: "", x: y, y: x, horiz: false};
                                }

                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);

                                if (stab1.getSign(x, y - 2) == oppositeSign(sign1)){
                                        throw new Error("Problem in addNumberSign");
                                }

                                stab1.makeBox(domino1);
                                stab2.makeBox(domino2);

                                let adjacentDomino1 = stab1.get(x - 1, y);
                                if (adjacentDomino1.n == "" && adjacentDomino1.horiz) {
                                        this.makeSpaceFor(adjacentDomino1, sign1);
                                }

                                if (stab1.getSign(x - 1, y) != "" && stab1.getSign(x + 1, y - 2) == "") {
                                        this.switchAfterAddX(stab1.get(x + 1, y));
                                }
                        }

                        // Henceforth, connect an up and a down cycle
                        else if (stab1.get(x, y - 1).horiz) {
                                // The cycles are connected at the top of the down cycle.
                                // console.log(sign1 + " " + x + " " + y);
                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                this.joinTwoCycles(domino1, number, "", stab1, stab2, tab1, tab2);
                                return;
                        }

                        else {
                                // Here, they're connected at the bottom of the down cycle.
                                // Shape change is possible in this case.
                                // console.log(sign1 + " " + x + " " + y + " connect below");
                                domino2 = {n: "", x: y - 1, y: x + 1, horiz: true};
                                this.joinTwoCycles(domino2, number, sign1, stab2, stab1, tab2, tab1);
                                return;
                        }
                }

                else if (gridPos == "Y") {
                        let cond1 = y == 0 || stab1.getRowLength(y - 1) > x + 1; // filled above right
                        let cond2 = x == 0 || stab1.getRowLength(y + 1) == x; // filled below left

                        if (!cond2) {
                                // TODO shape change is possible - no, it isn't
                                let rowAddSign = this.findRowAddSignX(sign1, x - 1, y);
                                if (rowAddSign > y) {
                                        return this.addNumberSign(number, sign1, rowAddSign);
                                }
                        }

                        if (cond1 && cond2) { // both filled, make new up cycle
                                domino1 = {n: sign1, x: x, y: y, horiz: false};
                                stab1.putDomino(domino1);
                                domino2 = {n: "", x: y, y: x, horiz: false};
                                stab2.putDomino(domino2);
                        }

                        else if (!cond1 && cond2) { // filled below left
                                if (!stab1.get(x, y - 1).horiz) { // extend up cycle
                                        domino1 = {n: sign1, x: x, y: y, horiz: false};
                                        stab1.putDomino(domino1);
                                        domino2 = {n: "", x: y - 1, y: x, horiz: true};
                                        stab2.putDomino(domino2);
                                } else { //contract down cycle
                                        let topDomino1 = stab1.get(x, y - 2);
                                        if (topDomino1.n == "") {
                                                this.putSignInCycleTop(topDomino1, sign1);
                                        }

                                        domino1 = {n: sign1, x: x, y: y, horiz: false};
                                        stab1.putDomino(domino1);
                                        stab1.makeBox(domino1);
                                        domino2 = {n: "", x: y, y: x, horiz: true};
                                        stab2.putDomino(domino2);
                                        stab2.makeBox(domino2);
                                }
                        }

                        else if (cond1 && !cond2) { // filled above right, contract unboxed cycle
                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                domino2 = {n: "", x: y, y: x, horiz: false};
                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);
                                stab1.makeBox(domino1);
                                stab2.makeBox(domino2);
                                domino1.n = number;
                                domino2.n = number;
                                tab1.insertAtEnd(new Domino(domino1));
                                tab2.insertAtEnd(new Domino(domino2));
                                if (stab1.getSign(x - 2, y) == "") {
                                        let bottomDomino1 = stab1.get(x, y);
                                        this.putSignInCycleBottom(bottomDomino1, sign1, stab2.getSign(y, x - 2));
                                }

                                return;

                        }

                        else { //both empty, connect unboxed cycle to up cycle
                                // console.log(sign1 + " " + x + " " + y + " connect below Y");
                                domino2 = {n: "", x: y - 1, y: x, horiz: true};
                                this.joinTwoCycles(domino2, number, sign1, stab2, stab1, tab2, tab1);
                                return;
                        }
                }

                else if (gridPos == "Z") {
                        let opSign1 = oppositeSign(sign1);
                        let pairDomino1 = stab1.get(x - 1, y - 1);
                        if (pairDomino1.horiz) { // extend down cycle
                                if (pairDomino1.n == sign1) {
                                        return this.addNumberSign(number, sign1, y + 1);
                                }

                                domino1 = {x: x, y: y, horiz: true};
                                domino2 = {x: y, y: x, horiz: false};

                                if (pairDomino1.n == opSign1) {
                                        if (stab1.getSign(x - 2, y) == opSign1) {
                                                domino1.n = sign1;
                                                domino2.n = "";
                                        } else {
                                                let pairDomino2 = stab2.get(y - 1, x - 1);
                                                let sign2 = stab2.getSign(y, x - 2);
                                                pairDomino1.n = "";
                                                domino1.n = "";
                                                pairDomino2.n = oppositeSign(sign2);
                                                domino2.n = sign2;
                                        }


                                        if (stab1.getSign(x + 1, y - 1) == "") {
                                                throw new Error("I didn't expect to be here 2");
                                                // in this case, we could call putSignInCycleBottom
                                        }
                                } else { // pairDomino1.n == ""
                                        let signData = stab1.findSignInRowRight(y - 1, x + 1);
                                        if (signData.sign == sign1) {
                                                return this.addNumberSign(number, sign1, y + 1);
                                        }

                                        // rightDomino1.n == opSign1;
                                        let rightDomino1 = stab1.get(signData.column, y - 1);
                                        let downDomino2 = stab2.get(y - 1, signData.column);
                                        let sign2 = stab2.getSign(y, x - 2);
                                        let opSign2 = oppositeSign(sign2);
                                        this.prepareForSign(downDomino2, opSign2);
                                        domino1.n = "";
                                        rightDomino1.n = "";
                                        downDomino2.n = opSign2;
                                        domino2.n = sign2;
                                }

                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);
                        } else { // !pairDomino.horiz
                                let rowAddSign = this.findRowAddSignZ(sign1, x, y);
                                if (rowAddSign > y) {
                                        return this.addNumberSign(number, sign1, rowAddSign);
                                }

                                let nextRowLength = stab1.getRowLength(y + 1);
                                if (nextRowLength < x) { // contract up cycle
                                        if (pairDomino1.n == opSign1) {
                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                stab1.putDomino(domino1);
                                                stab1.makeBox(domino1);
                                                domino2 = {n: "", x: y, y: x - 1, horiz: false};
                                                stab2.putDomino(domino2);
                                                stab2.makeBox(domino2);
                                        } else { // here topDomino1.n == opSign
                                                //N.B. inefficient, since this function is called in findRowAddSignZ
                                                let rowSignData = stab1.findSignInRowRight(y - 1, x + 1);
                                                let rightDomino1 = stab1.get(rowSignData.column, y - 1);
                                                //let topDomino1 = stab1.get(x + 1, y - 1);
                                                let sideDomino2 = stab2.get(y - 1, rowSignData.column);
                                                let sign2 = stab2.getSign(y - 1, x - 1);
                                                this.prepareForSign(sideDomino2, sign2);
                                                domino1 = {n: "", x: x, y: y, horiz: true};
                                                stab1.putDomino(domino1);
                                                stab1.makeBox(domino1);
                                                rightDomino1.n = "";
                                                sideDomino2.n = sign2;
                                                let opSign2 = oppositeSign(sign2); // not needed since making box
                                                // I could just omit n, since it's not needed
                                                domino2 = {n: opSign2, x: y, y: x - 1, horiz: false};
                                                stab2.putDomino(domino2);
                                                stab2.makeBox(domino2);
                                        }
                                } else { // make new down cycle
                                        if (pairDomino1.n == opSign1) {
                                                let topDomino1 = stab1.get(x + 1, y - 1);
                                                if (topDomino1.n == sign1) {
                                                        domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                        stab1.putDomino(domino1);
                                                        domino2 = {n: "", x: y, y: x, horiz: false};
                                                        stab2.putDomino(domino2);
                                                } else { //topDomino1.n == ""
                                                        let topDomino2 = stab2.get(y + 1, x - 1);
                                                        let pairDomino2 = stab2.get(y - 1, x - 1);
                                                        let sideDomino1 = stab1.get(x - 1, y + 1);
                                                        let sideDomino2 = stab2.get(y - 1, x + 1);
                                                        let sign2 = sideDomino2.n;
                                                        let opSign2 = oppositeSign(sign2);
                                                        // TODO fix this
                                                        if (topDomino2.n == opSign2) {
                                                                console.log("I'm surprised");
                                                        }

                                                        if (sideDomino1.n == opSign1 || topDomino2.n == opSign2) {
                                                                domino1 = {n: "", x: x, y: y, horiz: true};
                                                                stab1.putDomino(domino1);
                                                                pairDomino1.n = "";
                                                                domino2 = {n: opSign2, x: y, y: x, horiz: false};
                                                                stab2.putDomino(domino2);
                                                                pairDomino2.n = sign2;
                                                        } else { // topDomino2.n == sign2
                                                                domino1 = {n: opSign1, x: x, y: y, horiz: false};
                                                                stab1.putDomino(domino1);
                                                                pairDomino1.n = sign1
                                                                domino2 = {n: "", x: y, y: x, horiz: true};
                                                                stab2.putDomino(domino2);
                                                        }
                                                }

                                                let colSignData1 = stab1.findSignInColumnBelow(x - 1, y + 1);
                                                if (colSignData1.sign == "") {
                                                        let bottomDomino2 = stab2.get(colSignData1.row, x - 1);
                                                        if (stab2.isBottomCorner(bottomDomino2)) {
                                                                this.switchAfterAddZ(bottomDomino2, colSignData1.row == y + 1);
                                                        }
                                                }
                                        } else { //pairDomino.n == ""
                                                let topDomino1 = stab1.get(x + 1, y - 1);
                                                if (topDomino1.n == opSign1) {
                                                        let sideDomino2 = stab2.get(y - 1, x + 1);
                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                        this.prepareForSign(sideDomino2, sign2);

                                                        domino1 = {n: "", x: x, y: y, horiz: true};
                                                        stab1.putDomino(domino1);
                                                        topDomino1.n = "";
                                                        sideDomino2.n = sign2;
                                                        let opSign2 = oppositeSign(sign2);
                                                        domino2 = {n: opSign2, x: y, y: x, horiz: false};
                                                        stab2.putDomino(domino2);
                                                } else if (topDomino1.n == "") {
                                                        let signData = stab1.findSignInRowRight(y - 1, x + 3);
                                                        if (signData.sign == opSign1) {
                                                                let rightDomino1 = stab1.get(signData.column, y - 1);
                                                                let downDomino2 = stab2.get(y - 1, signData.column);
                                                                let sign2 = stab2.getSign(y - 1, x - 1);
                                                                this.prepareForSign(downDomino2, sign2);

                                                                domino1 = {n: "", x: x, y: y, horiz: true};
                                                                stab1.putDomino(domino1);
                                                                rightDomino1.n = "";
                                                                downDomino2.n = sign2;
                                                                let opSign2 = oppositeSign(sign2);
                                                                domino2 = {n: opSign2, x: y, y: x, horiz: false};
                                                                stab2.putDomino(domino2);
                                                        } else { // signData.sign = sign1, variation on funny situation
                                                                let topDomino2 = stab2.get(y + 1, x - 1);
                                                                let pairDomino2 = stab2.get(y - 1, x - 1);
                                                                let sideDomino1 = stab1.get(x - 1, y + 1);
                                                                let sideDomino2 = stab2.get(y - 1, x + 1);
                                                                let sign2 = sideDomino2.n;
                                                                let opSign2 = oppositeSign(sign2);
                                                                domino1 = {n: opSign1, x: x, y: y, horiz: false};
                                                                stab1.putDomino(domino1);
                                                                pairDomino1.n = sign1;
                                                                this.prepareForSign(sideDomino1, sign1);

                                                                sideDomino1.n = sign1;
                                                                domino2 = {n: "", x: y, y: x, horiz: true};
                                                                stab2.putDomino(domino2);
                                                                pairDomino2.n = "";
                                                                topDomino2.n = "";
                                                        }
                                                } else { // topDomino1.n = sign, funny situation
                                                        domino1 = {n: "", x: x, y: y, horiz: true};
                                                        stab1.putDomino(domino1);
                                                        let sideDomino1 = stab1.get(x - 1, y + 1);
                                                        this.prepareForSign(sideDomino1, sign1);
                                                        sideDomino1.n = sign1;

                                                        let topDomino2 = stab2.get(y + 1, x - 1);
                                                        let pairDomino2 = stab2.get(y - 1, x - 1);
                                                        let sign2 = pairDomino2.n;
                                                        pairDomino2.n = topDomino2.n;
                                                        topDomino2.n = "";
                                                        domino2 = {n: sign2, x: y, y: x, horiz: false};
                                                        stab2.putDomino(domino2);
                                                        // TODO call switchAfterAddZ for the change on side 2
                                                        //Done below?
                                                }

                                                let colSignData2 = stab2.findSignInColumnBelow(y - 1, x + 1);
                                                if (colSignData2.sign == "") {
                                                        let bottomDomino1 = stab1.get(colSignData2.row, y - 1);
                                                        if (stab1.isBottomCorner(bottomDomino1)) {
                                                                this.switchAfterAddZ(bottomDomino1, colSignData2.row == x + 1);
                                                        }
                                                }
                                        }
                                }
                        }
                }

                else if (gridPos == "W") {
                        let opSign1 = oppositeSign(sign1);
                        domino1 = {x: x, y: y, horiz: true};
                        domino2 = {x: y, y: x, horiz: false};
                        let pairDomino1 = stab1.get(x, y - 1);
                        let adjacentDomino1 = stab1.get(x - 1, y);
                        let signData = stab1.findSignInRowRight(y - 1, x);

                        if (adjacentDomino1.horiz && signData.sign == sign1) {
                                return this.addNumberSign(number, sign1, y + 1);
                        }

                        else if (pairDomino1.n == opSign1) {
                                if (adjacentDomino1.n == opSign1) {
                                        domino1.n = sign1;
                                        domino2.n = "";
                                } else { // adjacentDomino1.n == ""
                                        let pairDomino2 = stab2.get(y - 1, x);
                                        let sign2 = stab2.getSign(y, x - 1);
                                        pairDomino1.n = "";
                                        domino1.n = "";
                                        pairDomino2.n = oppositeSign(sign2);
                                        domino2.n = sign2;
                                }

                                if (stab1.getSign(x + 1, y - 1) == "") {
                                        throw new Error("I didn't expect to be here 2");
                                        // in this case, we could call putSignInCycleBottom
                                }

                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);
                        }

                        else if (signData.sign == opSign1) {
                                let pairDomino2 = stab2.get(y - 1, x);
                                let sign2 = pairDomino2.n;
                                let rightDomino1 = stab1.get(signData.column, y - 1);
                                let downDomino2 = stab2.get(y - 1, signData.column);
                                let adjacentSign1 = adjacentDomino1.n;
                                if (adjacentSign1 == opSign1) {
                                        pairDomino1.n = opSign1;
                                        domino1.n = sign1;
                                        pairDomino2.n = "";
                                        domino2.n = "";
                                } else if (adjacentSign1 == sign1) {
                                        pairDomino1.n = sign1;
                                        domino1.n = opSign1;
                                        pairDomino2.n = "";
                                        domino2.n = "";
                                } else { // adjacentSign == ""
                                        domino1.n = "";
                                        domino2.n = oppositeSign(sign2);
                                }

                                this.prepareForSign(downDomino2, sign2);

                                rightDomino1.n = "";
                                downDomino2.n = sign2;
                                stab1.putDomino(domino1);
                                stab2.putDomino(domino2);
                        }

                         // signData.sign == sign1
                         // We will close or contract an unboxed cycle.

                         //Contract unboxed cycle
                        else if (stab1.getRowLength(y + 2) == x) {
                                let shapeChange = false;
                                if (pairDomino1.n == "") {
                                        shapeChange = this.putSignInCycleTop(pairDomino1, sign1);
                                }

                                if (!shapeChange) {
                                        domino1 = {n: sign1, x: x, y: y, horiz: false};
                                        domino2 = {n: "", x: y, y: x, horiz: true};
                                } else {
                                        domino1 = {n: sign1, x: x, y: y + 1, horiz: false};
                                        domino2 = {n: "", x: y + 1, y: x, horiz: true};
                                }

                                stab1.putDomino(domino1);
                                stab1.makeBox(domino1);
                                stab2.putDomino(domino2);
                                stab2.makeBox(domino2);
                        }

                        // Try to close unboxed cycle
                        else {
                                let rowAddSign = this.findRowAddSignX(sign1, x - 1, y + 1);
                                if (rowAddSign > y + 1) {
                                        return this.addNumberSign(number, sign1, rowAddSign);
                                }

                                let shapeChange = false;
                                if (pairDomino1.n == "") {
                                        shapeChange = this.putSignInCycleTop(pairDomino1, sign1);
                                }

                                if (!shapeChange) {
                                        domino1 = {n: sign1, x: x, y: y, horiz: false};
                                        domino2 = {n: "", x: y, y: x, horiz: true};
                                } else {
                                        domino1 = {n: sign1, x: x - 1, y: y + 1, horiz: true};
                                        domino2 = {n: "", x: y + 1, y: x - 1, horiz: false};
                                }

                                stab1.putDomino(domino1);
                                stab1.makeBox(domino1);
                                stab2.putDomino(domino2);
                                stab2.makeBox(domino2);
                        }

                }

                let dominoData;
                if (sign1 == "+" || sign1 == "-") {
                        dominoData = {domino: new Domino(domino1), dualDomino: new Domino(domino2)};
                } else {
                        dominoData = {domino: new Domino(domino2), dualDomino: new Domino(domino1)};
                }

                let domino = dominoData.domino;
                let dualDomino = dominoData.dualDomino;
                domino.n = number;
                dualDomino.n = number;
                this.dualTabs.tab.insertAtEnd(domino);
                this.dualTabs.dtab.insertAtEnd(dualDomino);
        }

        configureForBox(sign1, x, y) {
                let stab1;
                let stab2;
                let tab1;
                let tab2;
                if (sign1 == "+" || sign1 == "-") {
                        stab1 = this.dualSignTabs.stab;
                        stab2 = this.dualSignTabs.dstab;
                } else {
                        stab1 = this.dualSignTabs.dstab;
                        stab2 = this.dualSignTabs.stab;
                }

                let opSign1 = oppositeSign(sign1);
                let cornerDomino1 = stab1.get(x, y);
                let topDomino1 = stab1.get(x + 2, y);
                let sideDomino1 = stab1.get(x, y + 2);
                let cornerDomino2 = stab2.get(y, x);
                let topDomino2 = stab2.get(y + 2, x);
                let sideDomino2 = stab2.get(y, x + 2);

                if (cornerDomino1.n != sign1) {
                        throw new Error("Wrong start for configureForBox");
                }

                // We can find a blank in the column by looking for a sign in the corresponding row
                // on the dual side.  If do not find a sign on the dual side,
                // then there are no blanks on this side.  So, the column is all sign1.
                let columnSignFind = stab2.findSignInRowRight(x, y + 2);
                if (columnSignFind.sign == "") {
                        return sign1;
                }

                let sign2 = columnSignFind.sign;
                //Now we're looking for opSign1 to the right of sign1
                let rowSignFind = stab1.findSignInRowRight(y, x + 2);
                let aboveColumnSignFind = false;
                let isBottomCorner = stab1.isBottomCorner(topDomino1);
                // We also check above
                if (rowSignFind.sign == "" && isBottomCorner) {
                        if (sideDomino2.n == sign2) {
                                this.switchInRow(cornerDomino2, sign2);
                                return sign2;
                        }

                        aboveColumnSignFind = stab1.findSignInColumnAbove(x + 2, y - 2);
                }

                 let row1 = columnSignFind.column;
                 if (topDomino1.n != "") {
                         if (row1 != y + 2) {
                                 this.switchInRow(topDomino2, sign2);
                         }

                         this.switchInColumn(sideDomino1, sign1);
                         if (sideDomino2.horiz) {
                                 let sideSignData = stab2.findSignInRowLeft(x + 2, y - 2);
                                 if (sideSignData.sign == sign2) {
                                         let leftDomino = stab2.get(sideSignData.column, x + 2);
                                         this.switchSignDown(leftDomino);
                                 }
                         }

                         return false;
                 }

                 // topDomino1.n == ""
                 if (rowSignFind.sign != "") {
                         this.switchInRow(topDomino1, opSign1);
                         this.switchInRow(stab2.get(y, x), sign2);
                         return false;
                 }

                 if (isBottomCorner && aboveColumnSignFind.sign == opSign1) {
                         this.switchInColumn(topDomino1, opSign1);
                         this.switchInRow(stab2.get(y, x), sign2);
                         return false;
                 }

                 // We need to move sign2 into the top corner.
                 this.switchInRow(cornerDomino2, sign2);
                 return sign2;
        }

        joinTwoCycles(domino1, number, sign2, stab1, stab2, tab1, tab2) {
                // fixed square
                let x = domino1.x + 1;
                let y = domino1.y;
                let domino2;

                if (stab1.get(x, y - 1)) {
                        stab2.moveCycleUpFromSquare({x: y, y: x - 1});
                        tab2.moveOpenCycle({x: y, y: x - 1});
                        domino2 = {n: sign2, x: y, y: x - 1, horiz: false};
                } else {
                        domino1.x = x;
                        domino1.y = y - 1;
                        domino1.horiz = false;
                        stab1.moveCycleUpToSquare({x: x - 1, y: y}, true);
                        tab1.moveOpenCycleToSquare({x: x - 1, y: y});
                        domino2 = {n: sign2, x: y - 1, y: x, horiz: true};
                }

                stab1.putDomino(domino1);
                stab2.putDomino(domino2);
                let domino1n = new Domino(domino1);
                let domino2n = new Domino(domino2);
                domino1n.n = number;
                domino2n.n = number;
                tab1.insertAtEnd(domino1n);
                tab2.insertAtEnd(domino2n);
                let topDomino1 = stab1.get(x, y - 2);
                let switchList1 = [];
                let switchList2 = [];

                this.closeDownPaired(topDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2);
                switchList1.forEach((topDomino1) => {
                                let sign1 = stab1.getSign(topDomino1.x - 1, topDomino1.y);
                                stab1.putSignsFromTop(topDomino1, oppositeSign(sign1));
                });
                switchList2.forEach((topDomino2) => {
                                let sign2 = stab2.getSign(topDomino2.x - 1, topDomino2.y);
                                stab2.putSignsFromTop(topDomino2, oppositeSign(sign2));
                });
        }

        closeDownPaired(topDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2, pairedBottomRow) {
                // fixed square
                let x = topDomino1.x + 1;
                let y = topDomino1.y;
                let bottomDomino2 = stab2.get(y, x);
                let boxed = stab1.get(x - 1, y + 1).isBoxed();
                let inPair = false;
                if (pairedBottomRow) {
                        inPair = true;
                }

                // currently, also makes some boxes
                // TODO - move this code?
                function getCornerData() {
                        let rowSign;
                        let columnSign;
                        let currentDomino1 = topDomino1;
                        let currentColumn1 = x;
                        let currentRow1 = y;
                        let paired = false;
                        let newPairedBottomRow;
                        if (boxed) {
                                while (true) {
                                        let nextDomino1 = stab1.get(currentColumn1, currentRow1 + 2);
                                        if (!nextDomino1) {
                                                return {newTopDomino1: currentDomino1, columnSign: columnSign, paired: paired, end: true};
                                        }

                                        currentDomino1 = nextDomino1;
                                        currentRow1 += 2;

                                        if (currentDomino1.n != "" && !columnSign) {
                                                columnSign = currentDomino1.n;
                                        }

                                        if (currentDomino1.horiz) {
                                                break;
                                        }

                                        stab1.makeBox(currentDomino1);
                                        stab2.makeBox(stab2.get(currentRow1, currentColumn1));

                                }

                                if (currentDomino1.n == "") {
                                        rowSign = stab2.getSign(currentRow1, currentColumn1);
                                }

                                if (inPair && pairedBottomRow <= currentRow1) {
                                        inPair = false;
                                }

                                while (true) {
                                        let nextDomino1 = stab1.get(currentColumn1 - 2, currentRow1);
                                        if (!inPair && !paired && stab1.hasPairFor(nextDomino1)) {
                                                paired = true;
                                                let cycleBottom1 = stab1.getBottomDomino(currentDomino1);
                                                let cycleCase1 = stab1.getCycleCase(cycleBottom1, currentDomino1);
                                                if (cycleCase1 == "F") {
                                                        let newSign1 = oppositeSign(nextDomino1.n);
                                                        stab1.putSignsFromTop(currentDomino1, newSign1);
                                                        switchList1.push(currentDomino1);
                                                } else if (cycleCase1 == "E") {
                                                        let fsb1 = cycleBottom1.getFixedSquare();
                                                        let cycleTop2 = stab2.get(fsb1.y, fsb1.x);
                                                        let fst1 = currentDomino1.getFixedSquare();
                                                        let cycleBottom2 = stab2.get(fst1.y, fst1.x);
                                                        let newSign2 = oppositeSign(stab2.getSign(fst1.y, fst1.x - 2));
                                                        stab2.putSignsFromBottomUnboxed(cycleBottom2, newSign2);
                                                        switchList2.push(cycleTop2);
                                                }
                                                // fixed square
                                                newPairedBottomRow = cycleBottom1.y;
                                        }

                                        currentDomino1 = nextDomino1;
                                        currentColumn1 -= 2;

                                        if (!currentDomino1.horiz) {
                                                break;
                                        }

                                        if (currentDomino1.n == "" && !rowSign) {
                                                rowSign = stab2.getSign(currentRow1, currentColumn1);
                                        }
                                }
                        } else { // !boxed
                                let nextDomino1 = stab1.get(currentColumn1, currentRow1 + 2);
                                if (!nextDomino1) {
                                        return {newTopDomino1: currentDomino1, columnSign: columnSign, paired: paired, end: true};
                                }

                                currentDomino1 = nextDomino1;
                                currentRow1 += 2;
                                while (true) {
                                        nextDomino1 = stab1.get(currentColumn1, currentRow1 + 2);
                                        if (!nextDomino1) {
                                                if (!stab1.get(currentColumn1 - 2, currentRow1).isBoxed()) {
                                                        if (currentDomino1.n != "" && !columnSign) {
                                                                columnSign = currentDomino1.n;
                                                        }

                                                        break;
                                                }

                                                stab1.makeBox(currentDomino1);
                                                stab2.makeBox(stab2.get(currentRow1, currentColumn1));
                                                return {newTopDomino1: currentDomino1, columnSign: columnSign, paired: paired, end: true};
                                        }

                                        if (nextDomino1.isBoxed()) {
                                                if (currentDomino1.n != "" && !columnSign) {
                                                        columnSign = currentDomino1.n;
                                                }

                                                break;
                                        }


                                        if (currentDomino1.n != "" && !columnSign) {
                                                columnSign = currentDomino1.n;
                                        }

                                        stab1.makeBox(currentDomino1);
                                        stab2.makeBox(stab2.get(currentRow1, currentColumn1));

                                        currentDomino1 = nextDomino1;
                                        currentRow1 += 2;
                                }

                                if (currentDomino1.n == "") {
                                        rowSign = stab2.getSign(currentRow1, currentColumn1);
                                }

                                if (inPair && pairedBottomRow <= currentRow1) {
                                        inPair = false;
                                }

                                while (true) {
                                        let nextDomino1 = stab1.get(currentColumn1 - 2, currentRow1);

                                        //TODO check for other versions of this condition
                                        if (nextDomino1.isBoxed()) {
                                                break;
                                        }

                                        if (!inPair && !paired && stab1.hasPairFor(nextDomino1)) {
                                                paired = true;
                                                let fst1 = currentDomino1.getFixedSquare();
                                                let cycleBottom2 = stab2.get(fst1.y, fst1.x);
                                                let cycleTop2 = stab2.getTopDomino(cycleBottom2);
                                                let fst2 = cycleTop2.getFixedSquare();
                                                let cycleBottom1 = stab1.get(fst2.y, fst2.x);
                                                let cycleCase2 = stab2.getCycleCase(cycleBottom2, cycleTop2);
                                                if (cycleCase2 == "E") { // so cycleCase1 = "F"
                                                        let newSign1 = oppositeSign(stab1.getSign(fst2.y, fst2.x - 2));
                                                        stab1.putSignsFromBottomUnboxed(cycleBottom1, newSign1);
                                                        switchList1.push(currentDomino1);
                                                } else if (cycleCase2 == "F") { // so cycleCase1 == "E"
                                                        let newSign2 = oppositeSign(stab2.getSign(fst2.x - 2, fst2.y));
                                                        stab2.putSignsFromTop(cycleTop2, newSign2);
                                                        switchList2.push(cycleTop2);
                                                }
                                                //fixed square
                                                newPairedBottomRow = fst2.x;
                                        }

                                        currentDomino1 = nextDomino1;
                                        currentColumn1 -= 2;

                                        if (currentDomino1.n == "" && !rowSign) {
                                                rowSign = stab2.getSign(currentRow1, currentColumn1);
                                        }
                                }
                        }

                        return {newTopDomino1: currentDomino1, rowSign: rowSign, columnSign: columnSign, paired: paired, newPairedBottomRow: newPairedBottomRow};
                }


                let cornerData = getCornerData();

                let newTopDomino1 = cornerData.newTopDomino1;
                let fs = newTopDomino1.getFixedSquare();
                let newX = fs.x;
                let newY = fs.y;
                if (newX == x && newY == y) {
                        return;
                }

                let newBottomDomino2 = stab2.get(newY, newX);

                //TODO check this
                if (!cornerData.end) {
                        let rowStartDomino1 = newTopDomino1;
                        let columnStart1 = newX;
                        let columnStartDomino2 = stab2.get(newY, columnStart1);
                        let currentRowDomino1 = rowStartDomino1;
                        let currentColumn1 = columnStart1;
                        let currentColumnDomino2 = columnStartDomino2;
                        while (true) {
                                stab1.makeBox(currentRowDomino1);
                                stab2.makeBox(currentColumnDomino2);
                                if (currentRowDomino1.x >= x - 1) {
                                        break;
                                }

                                currentColumn1 += 2;
                                currentRowDomino1 = stab1.get(currentColumn1, newY);
                                currentColumnDomino2 = stab2.get(newY, currentColumn1);
                        }
                }

                let nextDomino1 = stab1.get(newX, newY + 2);
                let nextDomino2 = stab2.get(newY + 2, newX);
                if (newTopDomino1.n == "") {
                        if (topDomino1.n != "") {
                                let expectedSign1 = SignTableau.getExpectedSign(topDomino1, newTopDomino1);
                                let shapeChange = this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, expectedSign1);
                                if (shapeChange && nextDomino1) {
                                        stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                        stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                }
                        } else { // topDomino1.n == ""
                                let expectedSign2 = SignTableau.getExpectedSign(bottomDomino2, newBottomDomino2);
                                if (newBottomDomino2.n != expectedSign2) {
                                        let sign1 = cornerData.columnSign;
                                        let expectedSign1 = SignTableau.getExpectedSign(topDomino1, newTopDomino1, sign1);
                                        let shapeChange = this.putSignInCycleTop(newTopDomino1, expectedSign1, expectedSign2);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }

                                        shapeChange = this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, expectedSign1);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }
                                }
                        }
                } else { //newTopDomino1.n != ""
                        if (topDomino1.n != "") {
                                let expectedSign1 = SignTableau.getExpectedSign(topDomino1, newTopDomino1);
                                if (newTopDomino1.n != expectedSign1) {
                                        let sign2 = cornerData.rowSign;
                                        let shapeChange = this.putSignInCycleBottom(newBottomDomino2, sign2, expectedSign1);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }


                                        shapeChange = this.putSignInCycleTop(newTopDomino1, newTopDomino1.n, sign2);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }
                                }
                        } else { // topDomino1.n == ""
                                let expectedSign2 = SignTableau.getExpectedSign(bottomDomino2, newBottomDomino2);
                                if (!cornerData.columnSign || !cornerData.rowSign || cornerData.rowSign == expectedSign2) {
                                        let shapeChange = this.putSignInCycleTop(newTopDomino1, newTopDomino1.n, expectedSign2);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }

                                } else {
                                        let sign1 = cornerData.columnSign;
                                        let expectedSign1 = SignTableau.getExpectedSign(topDomino1, newTopDomino1, sign1);
                                        let shapeChange = this.putSignInCycleTop(newTopDomino1, expectedSign1, expectedSign2);
                                        if (shapeChange && nextDomino1) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }

                                        let sign2 = cornerData.rowSign;
                                        if (newTopDomino1.n != expectedSign1) {
                                                let shapeChange = this.putSignInCycleBottom(newBottomDomino2, sign2, expectedSign1);
                                                if (shapeChange && nextDomino1) {
                                                        stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                        stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                                }

                                                shapeChange = this.putSignInCycleTop(newTopDomino1, newTopDomino1.n, sign2);
                                                if (shapeChange && nextDomino1) {
                                                        stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                        stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                                }
                                        }
                                }

                        }
                }

                if (!cornerData.end) {
                        let currentPairedBottomRow;
                        if (inPair) {
                                currentPairedBottomRow = pairedBottomRow;
                        } else {
                                currentPairedBottomRow = cornerData.newPairedBottomRow;
                        }

                        this.closeDownPaired(newTopDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2, currentPairedBottomRow);
                }
        }

        openTwoCycles(startDomino1, targetDomino1, stab1, stab2, tab1, tab2) {
                // startDomino1 is the topDomino of the lower cycle
                // targetDomino1 is the position of the newly added domino
                // TODO, maybe fix the above
                // for now, we'll fix it like this:
                let topPairDomino1 = stab1.get(targetDomino1.x, targetDomino1.y);
                if (!targetDomino1.isBoxed()) {
                        tab1.moveOpenCycle({x: targetDomino1.x, y: targetDomino1.y + 1});
                } else {
                        tab2.moveOpenCycleToSquare({x: targetDomino1.y + 1, y: targetDomino1.x});
                }

                let x = topPairDomino1.x - 1;
                let y = topPairDomino1.y - 1;
                let topCornerDomino1 = stab1.get(x, y);
                let switchList1 = [];
                let switchList2 = [];
                this.openUpPaired(startDomino1, topCornerDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2);

                let cycleBoxed = stab1.get(x - 1, y + 1).isBoxed();
                let topBoxed = topPairDomino1.isBoxed();
                let bottomPairDomino2 = stab2.get(y + 1, x + 1);
                if (cycleBoxed) {
                        if (!topBoxed) {
                                stab1.tableau.flipDomino(topPairDomino1);
                                stab2.tableau.flipDomino(bottomPairDomino2);
                        }

                        stab2.moveCycleDownToSquare({x: y + 2, y: x + 1}, true);
                } else { // !cycleBoxed
                        if (topBoxed) {
                                stab1.tableau.flipDomino(topPairDomino1);
                                stab2.tableau.flipDomino(bottomPairDomino2);
                        }

                        stab1.tableau.flipDominosAlt(stab1.get(x, y + 2), topPairDomino1);
                        stab2.tableau.flipDominosAlt(stab2.get(y + 2, x), bottomPairDomino2);
                        stab1.moveCycleDownFromSquare({x: x + 1, y: y + 2});
                }

                //TODO put last sign in if necessary
                let oldSign1= topCornerDomino1.n;
                let innerSign1 = stab1.getSign(x - 2, y);
                let bottomCornerDomino2 = stab2.get(y, x);
                if (innerSign1 == "" && oldSign1 != "") {
                        topCornerDomino1.n = "";
                        topPairDomino1.n = "";
                        let sign2 = stab2.getSign(y, x - 2);
                        bottomCornerDomino2.n = sign2;
                        bottomPairDomino2.n = oppositeSign(sign2);
                } else if (innerSign1 != "" && oldSign1 == "") {
                        topCornerDomino1.n = oppositeSign(innerSign1);
                        topPairDomino1.n = innerSign1;
                        bottomCornerDomino2.n = "";
                        bottomPairDomino2.n = "";
                }

                let newTopDomino1 = stab1.get(x + 2, y);
                if (oldSign1 != "" && newTopDomino1.n == "") {
                        let newBottomDomino2 = stab2.get(y, x + 2);
                        this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, oppositeSign(oldSign1));
                }

                switchList1.forEach((topDomino1) => {
                                let sign1 = stab1.getSign(topDomino1.x - 1, topDomino1.y);
                                stab1.putSignsFromTop(topDomino1, oppositeSign(sign1));
                });
                switchList2.forEach((topDomino2) => {
                                let sign2 = stab2.getSign(topDomino2.x - 1, topDomino2.y);
                                stab2.putSignsFromTop(topDomino2, oppositeSign(sign2));
                });
        }

        openUpPaired(topDomino1, lastDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2, pairedTopRow) {
                // fixed square
                let x = topDomino1.x + 1;
                let y = topDomino1.y;
                let bottomDomino2 = stab2.get(y, x);
                let inPair = false;
                if (pairedTopRow && pairedTopRow != y) {
                        inPair = true;
                }

                function getCornerData() {
                        let rowSign;
                        let columnSign;
                        let currentDomino1 = topDomino1;
                        let currentColumn1 = x;
                        let currentRow1 = y;
                        let paired = false;
                        let newPairedTopRow = false;
                        while (true) {
                                let nextDomino1 = stab1.get(currentColumn1 + 2, currentRow1);
                                if (!nextDomino1 || !nextDomino1.horiz) {
                                        break;
                                }

                                currentDomino1 = nextDomino1;
                                currentColumn1 += 2;
                                if (currentDomino1.n == "" && !rowSign) {
                                        rowSign = stab2.getSign(currentRow1, currentColumn1);
                                }
                        }

                        if (currentDomino1.n != "") {
                                columnSign = currentDomino1.n;
                        }

                        while (true) {
                                let nextDomino1 = stab1.get(currentColumn1, currentRow1 - 2);
                                if (nextDomino1.box || nextDomino1.horiz) {
                                        break;
                                }

                                if (!inPair && !paired && stab1.hasPairFor(nextDomino1)) {
                                        if (currentRow1 - 2 == lastDomino1.y) {
                                                currentDomino1 = nextDomino1;
                                                break;
                                        } else {
                                                paired = true;
                                                let cycleTop1 = stab1.getTopDomino(currentDomino1);
                                                let cycleCase = stab1.getCycleCase(currentDomino1, cycleTop1);
                                                if (cycleCase == "F") {
                                                        let newSign1 = oppositeSign(nextDomino1.n);
                                                        stab1.putSignsFromBottom(currentDomino1, newSign1);
                                                        switchList1.push(cycleTop1);
                                                } else if (cycleCase == "E") {
                                                        let cycleTop2 = stab2.get(currentRow1, currentColumn1);
                                                        let newSign2 = oppositeSign(stab2.getSign(currentRow1 - 2, currentColumn1));
                                                        stab2.putSignsFromTop(cycleTop2, newSign2);
                                                        switchList2.push(cycleTop2);
                                                }

                                                newPairedTopRow = cycleTop1.y;
                                        }
                                }

                                currentDomino1 = nextDomino1;
                                currentRow1 -= 2;
                                if (currentDomino1.n != "" && !columnSign) {
                                        columnSign = currentDomino1.n;
                                }
                        }

                        return {newTopDomino1: currentDomino1, rowSign: rowSign, columnSign: columnSign, paired: paired, newPairedTopRow: newPairedTopRow};
                }


                let cornerData = getCornerData();
                //TODO remove paired above

                let newTopDomino1 = cornerData.newTopDomino1;
                let newX = newTopDomino1.x;
                let newY = newTopDomino1.y;
                let newBottomDomino2 = stab2.get(newY, newX);


                let pairDomino1 = stab1.get(x - 1, y + 1);
                let boxed = pairDomino1.isBoxed();
                let currentColumn1 = newX - 2;
                let currentRow1 = y - 2;
                if (boxed) {
                        while (currentColumn1 >= x) {
                                stab1.unmakeBox(currentColumn1, y - 2, 1);
                                stab2.unmakeBox(y - 2, currentColumn1, 3);
                                currentColumn1 -= 2;
                        }

                        stab1.unmakeBox(currentColumn1, y - 2, 2);
                        stab2.unmakeBox(y - 2, currentColumn1, 4);

                        while(currentRow1 > newY) {
                                stab1.unmakeBox(newX - 2, currentRow1 - 2, 2);
                                stab2.unmakeBox(currentRow1 - 2, newX - 2, 4);
                                currentRow1 -= 2;
                        }
                } else { // !boxed
                        stab1.unmakeBox(currentColumn1, y - 2, 3);
                        stab2.unmakeBox(y - 2, currentColumn1, 1);
                        while (currentColumn1 >= x) {
                                currentColumn1 -= 2;
                                stab1.unmakeBox(currentColumn1, y - 2, 4);
                                stab2.unmakeBox(y - 2, currentColumn1, 2);
                        }

                        while(currentRow1 > newY) {
                                stab1.unmakeBox(newX - 2, currentRow1 - 2, 3);
                                stab2.unmakeBox(currentRow1 - 2, newX - 2, 1);
                                currentRow1 -= 2;
                        }
                }

                if (pairDomino1.n != "") {
                        let expectedSign1 = SignTableau.getExpectedSign(stab1.get(x - 2, y), newTopDomino1);
                        stab1.putSignsFromTop(newTopDomino1, oppositeSign(expectedSign1));
                } else { // pairDomino1.n == ""
                        let expectedSign2 = SignTableau.getExpectedSign(stab2.get(y, x - 2), newBottomDomino2);
                        stab2.putSignsFromBottom(newBottomDomino2, expectedSign2);
                }

                let nextDomino1 = stab1.get(newX, newY + 2);
                let nextDomino2 = stab2.get(newY + 2, newX);
                if (topDomino1.n == "") {
                        let expectedSign2 = SignTableau.getExpectedSign(bottomDomino2, newBottomDomino2);
                        if (newTopDomino1.n != "") {
                                let shapeChange = this.putSignInCycleTop(newTopDomino1, newTopDomino1.n, expectedSign2);
                                if (shapeChange) {
                                        stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                        stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                }
                        } else { // newTopDomino1.n == ""
                                if (newBottomDomino2.n != expectedSign2) {
                                        let sign1 = cornerData.columnSign;
                                        let shapeChange = this.putSignInCycleTop(newTopDomino1, sign1, expectedSign2);
                                        if (shapeChange) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }

                                        shapeChange = this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, sign1);
                                        if (shapeChange) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }
                                }
                        }
                } else { //topDomino1.n != ""
                        let expectedSign1 = SignTableau.getExpectedSign(topDomino1, newTopDomino1);
                        if (newTopDomino1.n != "") {
                                if (newTopDomino1.n != expectedSign1) {
                                        let sign2 = cornerData.rowSign;
                                        let expectedSign2 = SignTableau.getExpectedSign(newBottomDomino2, bottomDomino2, sign2);
                                        let shapeChange = this.putSignInCycleBottom(newBottomDomino2, expectedSign2, expectedSign1);
                                        if (shapeChange) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }


                                        shapeChange = this.putSignInCycleTop(newTopDomino1, newTopDomino1.n, expectedSign2);
                                        if (shapeChange) {
                                                stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                        }
                                }
                        } else { // newTopDomino1.n == ""
                                let sign1 = cornerData.columnSign;
                                if (sign1 != expectedSign1) {
                                        let sign2 = cornerData.rowSign;
                                        let expectedSign2 = SignTableau.getExpectedSign(newBottomDomino2, bottomDomino2, sign2);
                                        let shapeChange = this.putSignInCycleBottom(newBottomDomino2, expectedSign2, expectedSign1);
                                        if (shapeChange) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }

                                        if (newBottomDomino2.n != expectedSign2) {
                                                shapeChange = this.putSignInCycleTop(newTopDomino1, sign1, expectedSign2);
                                                if (shapeChange) {
                                                        stab1.moveCycleDownFromSquare({x: newX, y: newY + 1}, nextDomino1);
                                                        stab2.moveCycleUpFromSquare({x: newY + 1, y: newX}, nextDomino2);
                                                }

                                                shapeChange = this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, sign1);
                                                if (shapeChange) {
                                                        stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                        stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                                }
                                        }
                                } else {
                                        let shapeChange = this.putSignInCycleBottom(newBottomDomino2, newBottomDomino2.n, sign1);
                                        if (shapeChange) {
                                                stab1.moveCycleUpToSquare({x: newX, y: newY + 1}, false);
                                                stab2.moveCycleDownToSquare({x: newY + 1, y: newX}, false);
                                        }
                                }

                        }
                }

                let currentPairedTopRow;
                if (inPair) {
                        currentPairedTopRow = pairedTopRow;
                } else {
                        currentPairedTopRow = cornerData.newPairedTopRow;
                }

                if (newTopDomino1.y != lastDomino1.y) {
                        this.openUpPaired(newTopDomino1, lastDomino1, stab1, stab2, tab1, tab2, switchList1, switchList2, currentPairedTopRow);
                }
        }

        static SOpqEvenRobS(parameter) {
                let myTableaux = new Tableaux();
                for (let number = 1; number < parameter.length; ++number) {
                        let info = parameter[number];
                        if (info == "+" || info == "-" || info == "s" || info == "t") {
                                myTableaux.addNumberSign(number, info, 0);
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                let rsNumber = parameter[first] == 0 ? first : -first;
                                let posData = myTableaux.dualTabs.addRS(rsNumber);
                                let pos = posData.pos;
                                let dpos = posData.dpos;
                                let gridPos = getGridSubPos(pos);
                                let dGridPos = getGridSubPos(dpos);

                                if ((gridPos == "Y" && pos.horiz) || (dGridPos == "Y" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let signChoice;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                signChoice = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                signChoice = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;

                                        let rowLength = stab1.getRowLength(y + 1);
                                        // make a new up cycle
                                        if (rowLength == x) {
                                                let domino1 = new Domino({n: number, x: x, y: y + 1, horiz: true});
                                                let domino2 = new Domino({n: number, x: y + 1, y: x, horiz: false});
                                                tab1.insertAtEnd(domino1);
                                                tab2.insertAtEnd(domino2);
                                                stab1.putBox(x, y);
                                                stab1.moveBoxUp(x, y);
                                                stab2.putBox(y, x);
                                                stab2.moveBoxUp(y, x);
                                        }
                                        // contract a down cycle
                                        else {
                                                let domino1 = new Domino(pos1);
                                                let domino2 = new Domino(pos2);
                                                let sign1;
                                                let sideDomino1 = stab1.get(x - 2, y);
                                                let sideSign1 = sideDomino1.n;
                                                let topDomino1 = stab1.get(x, y - 2);
                                                let topSign1 = topDomino1.n;
                                                if (sideSign1 != "") {
                                                        sign1 = oppositeSign(sideSign1);
                                                }

                                                // henceforth sideSign1 == ""
                                                else if (topSign1 != "") {
                                                        sign1 = topSign1;
                                                }

                                                // henceforth topSign1 == ""
                                                else {
                                                        let cycleTop = stab1.getTopDomino(sideDomino1);
                                                        if (cycleTop.n != "") {
                                                                // TODO new code
                                                                sign1 = SignTableau.getExpectedSign(cycleTop, topDomino1);
                                                        } else {
                                                                sign1 = signChoice;
                                                        }

                                                }

                                                let opSign1 = oppositeSign(sign1);
                                                if (sideSign1 == "") {
                                                        myTableaux.putSignInCycleBottom(sideDomino1, opSign1);
                                                }

                                                domino1.n = sign1;
                                                domino2.n = "";

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);

                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);

                                                // TODO think this over
                                                if (sideDomino1.horiz && sideDomino1.n == "") {
                                                        let newDomino1 =  stab1.get(domino1.x, domino1.y);
                                                        myTableaux.makeSpaceFor(newDomino1);
                                                }

                                                myTableaux.addNumberSign(number, opSign1, y + 1);
                                        }

                                }

                                else if (gridPos == "Y" && dGridPos == "Y") { // !pos.horiz and !dpos.horiz
                                        let x = pos.x;
                                        let y = pos.y;
                                        let domino = new Domino({n: number, x: x + 1, y: y, horiz: false});
                                        let dualDomino = new Domino({n: number, x: y + 1, y: x, horiz: false});
                                        myTableaux.dualTabs.tab.insertAtEnd(domino);
                                        myTableaux.dualTabs.dtab.insertAtEnd(dualDomino);
                                        myTableaux.dualSignTabs.stab.putBox(x, y);
                                        myTableaux.dualSignTabs.stab.moveBoxUp(x, y);
                                        myTableaux.dualSignTabs.dstab.putBox(y, x);
                                        myTableaux.dualSignTabs.dstab.moveBoxUp(y, x);
                                }

                                else if ((gridPos == "X" && !pos.horiz) && (dGridPos == "X" && !dpos.horiz)){
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let testSign = myTableaux.dualSignTabs.stab.getSign(pos.x - 1, pos.y);
                                        let sign;
                                        if (testSign != "") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                sign = testSign;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                sign = stab1.getSign(pos1.x - 1, pos1.y);
                                        }

                                        let x = pos1.x - 1;
                                        let y = pos1.y;
                                        stab1.putBox(x, y);
                                        stab1.moveBoxUp(x, y);
                                        stab2.putBox(y, x);
                                        stab2.moveBoxUp(y, x);
                                        myTableaux.addNumberSign(number, sign, y + 2);
                                }

                                else if ((gridPos == "X" && pos.horiz) || (dGridPos == "X" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let signChoice;
                                        if (gridPos == "X") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                signChoice = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                signChoice = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1;
                                        let domino2;

                                        let signData = stab1.findSignInRowLeft(y, x - 1);
                                        let currentColumn1 = signData.column;
                                        let currentDomino1 = stab1.get(currentColumn1, y);
                                        let adjacentDomino1 = stab1.get(x - 1, y);
                                        if (signData.sign != "" && adjacentDomino1.n == "") {
                                                // In this case currentDomino1 is a top corner
                                                // and we can move currentDomino1 down,
                                                // so we'll do it now.
                                                // We'll want it down anyway to add the second domino.
                                                // Moving it now makes the choice of sign1,
                                                // and the code to handle it, easier here.
                                                //  TODO maybe not, this will disturb the invariant
                                                // change this to use makeSpaceFor lower down?
                                                let currentDomino2 = stab2.get(y, currentColumn1);
                                                myTableaux.switchInRow(currentDomino2, stab2.getSign(y, x - 1));
                                        }

                                        // TODO We also need to move adjacentDomino1 down if it has a sign in it
                                        // and there's another sign available in its column
                                        // maybe not

                                        let sign1 = signChoice;
                                        if (adjacentDomino1.n != "") { // so, adjacentDomino1.n == signData.sign
                                                sign1 = oppositeSign(adjacentDomino1.n);
                                        }

                                        let upperLeft = y == 0 ? null : stab1.get(x - 1, y - 1);
                                        let upperRight = y == 0 ? null : stab1.get(x + 1, y - 1);
                                        // extend boxed up cycle
                                        if (y == 0 || upperRight.n == "*" || (upperLeft.horiz && stab1.getRowLength(y - 1) > x + 2)) { // extend up cycle
                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                stab1.putDomino(domino1);
                                                domino2 = {n: "", x: y, y: x + 1, horiz: false};
                                                stab2.putDomino(domino2);
                                        }

                                        else if (stab1.getRowLength(y - 1) > x + 2) { // contract down cycle
                                                if (adjacentDomino1.n == "") {
                                                        let upDomino1 = stab1.get(x, y - 2);
                                                        let upSign1 = upDomino1.n;
                                                        if (upSign1 != "") {
                                                                sign1 = upSign1;
                                                        }
                                                }

                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                domino2 = {n: "", x: y, y: x, horiz: false};

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);

                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                        }

                                        else { // close down cycle
                                                let topDomino1 = stab1.get(x + 1, y - 2);
                                                let topSign1 = topDomino1.n;
                                                let upColSignData1;
                                                let shapeChange = false;
                                                // let sign2;
                                                let opSign1 = oppositeSign(sign1);
                                                if (stab1.isBottomCorner(topDomino1) && topSign1 == "") {
                                                        upColSignData1 = stab1.findSignInColumnAbove(x + 1, y - 4);
                                                }

                                                // If there's a vertical blank domino below, bring it up.
                                                // this is okay, since ultimately you're adding two dominos,
                                                // one of each sign.
                                                if (adjacentDomino1.n == opSign1) { //&& stab1.getColumnLength(x - 1) > y + 2)
                                                        // In the situation just below, there will be a shape change,
                                                        // and we'll be adding the horizontal domino on side 2
                                                        // So, we'll want a blank domino for adjacentDomino2
                                                        // We'll get it here.
                                                        // Looking on side 1, we need to bring the sign in before moving a blank up
                                                        if (topSign1 == "") {
                                                                let topRowSignData1 = stab1.findSignInRowRight(y - 2, x + 1);
                                                                let topRowSignData2 = stab2.findSignInRowRight(x - 1, y);
                                                                let adjacentSign2 = stab2.getSign(y - 2, x + 1);
                                                                if (topRowSignData2.sign == adjacentSign2 && topRowSignData1.sign != "") {
                                                                       myTableaux.switchInRow(topDomino1, topRowSignData1.sign);
                                                               }
                                                        }

                                                        let rowAddSign;
                                                        if (!adjacentDomino1.horiz) {
                                                                rowAddSign = myTableaux.findRowAddSignX(opSign1, x, y, true);
                                                        } else {
                                                                rowAddSign = y + 1;
                                                        }

                                                        if (rowAddSign > y) {
                                                                let cornerSign2 = stab2.getSign(y - 2, x - 1);
                                                                // We want to put sign1 in domino1.
                                                                // However, in this case, there's an opSign1 in the column above
                                                                // So, we want to pull the opSign1 down.
                                                                // However, that will put us in the funny situation.
                                                                // This is okay, except sometimes the resolution of the funny situation
                                                                // causes a clash with a sign in the up column on side 2.
                                                                // So, we need to check for that, and, in that case,
                                                                //  we need to pull that up sign down on side 2.
                                                                // Once we've done that, adjacentDomino1 will be blank,
                                                                // and we can move the sign1 from domino1 left into adjacentDomino1.
                                                                let topDomino2 =  stab2.get(y, x - 1);
                                                                if (upColSignData1 && upColSignData1.sign == opSign1) {
                                                                        if (stab2.isBottomCorner(topDomino2)) {
                                                                                let upColSignData2 = stab2.findSignInColumnAbove(y, x - 3);
                                                                                let sign2 = upColSignData2.sign;
                                                                                if (sign2 == oppositeSign(cornerSign2)) {
                                                                                        myTableaux.switchInColumn(topDomino2, sign2);
                                                                                        domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                                                        domino2 = {n: "", x: y, y: x, horiz: false};
                                                                                        stab1.putDomino(domino1);
                                                                                        stab2.putDomino(domino2);
                                                                                        let signedDomino1 = stab1.get(x + 1, y);
                                                                                        myTableaux.dualSignTabs.moveSign(signedDomino1, adjacentDomino1);
                                                                                        stab1.makeBox(domino1);
                                                                                        stab2.makeBox(domino2);
                                                                                        let newDomino2 = stab2.get(y, x + 1);
                                                                                        myTableaux.makeSpaceFor(newDomino2);
                                                                                        myTableaux.addNumberSign(number, oppositeSign(sign1), rowAddSign);
                                                                                        continue;
                                                                                }
                                                                        }

                                                                        myTableaux.switchInColumn(topDomino1, opSign1);
                                                                }

                                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                                domino2 = {n: "", x: y, y: x, horiz: false};

                                                                // This is the funny situation
                                                                if (topDomino1.n == opSign1) {
                                                                        // The funny situation gives us three signed dominos on side 1,
                                                                        // two with opSign1 and one with sign1.
                                                                        // We can conglomerate them into one opSign1 domino
                                                                        // by extracting the two signs on side2
                                                                        // which are contained in the funny situation.
                                                                       // However, sometimes you can't do this.
                                                                       // changeBoxSign could put a domino on side 2 into a column
                                                                       // with its oppositeSign above it.
                                                                       // In this case, pull the sign down first.
                                                                       if (stab1.isBottomCorner(adjacentDomino1)) {
                                                                               let upColSignData2 = stab2.findSignInColumnAbove(y, x - 3);
                                                                               let sign2 = upColSignData2.sign;
                                                                               let cornerSign2 = stab2.getSign(y - 2, x - 1);
                                                                               if (sign2 == oppositeSign(cornerSign2)) {
                                                                                       let topDomino2 =  stab2.get(y, x - 1);
                                                                                       myTableaux.switchInColumn(topDomino2, sign2);
                                                                                       stab1.putDomino(domino1);
                                                                                       stab2.putDomino(domino2);
                                                                                       let signedDomino1 = stab1.get(x + 1, y);
                                                                                       stab1.makeBox(domino1);
                                                                                       stab2.makeBox(domino2);
                                                                                       myTableaux.dualSignTabs.moveSign(signedDomino1, adjacentDomino1);
                                                                                       let newDomino2 = stab2.get(y, x + 1);
                                                                                       myTableaux.makeSpaceFor(newDomino2);
                                                                               } else {
                                                                                       stab1.putDomino(domino1);
                                                                                       stab2.putDomino(domino2);
                                                                                       myTableaux.changeBoxSigns(pos1, opSign1);
                                                                               }
                                                                       } else {
                                                                               stab1.putDomino(domino1);
                                                                               stab2.putDomino(domino2);
                                                                               myTableaux.changeBoxSigns(pos1, opSign1);
                                                                       }

                                                                } else if (topDomino1.n == "") {
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        // TODO check later if need the AddX
                                                                        myTableaux.switchAfterAddX(stab1.get(x + 1, y));
                                                                } else { // topDomino1.n == sign1
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                }

                                                                myTableaux.addNumberSign(number, oppositeSign(sign1), rowAddSign);
                                                                continue;
                                                        }

                                                        if (rowAddSign == -1) {
                                                                shapeChange = true;
                                                        }
                                                }

                                                if (shapeChange) {
                                                        let adjacentSign2 = stab2.getSign(y - 2, x + 1);
                                                        let sign2 = stab2.getSign(y, x - 1);
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (adjacentSign2 == "") {
                                                                domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                domino2 = {n: sign2, x: y - 1, y: x + 1, horiz: true};
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                let newDomino2 = stab2.get(y, x + 1);
                                                                myTableaux.makeSpaceFor(newDomino2);
                                                                myTableaux.addNumberSign(number, opSign2, x + 2);

                                                        } else { // adjacentSign2 == sign2, funny situation
                                                                if (upColSignData1 && upColSignData1.sign == opSign1) {
                                                                        myTableaux.switchInColumn(topDomino1, opSign1);
                                                                        domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                        domino2 = {n: opSign2, x: y - 1, y: x + 1, horiz: true};
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        let signedDomino2 = stab2.get(y, x + 1);
                                                                        let adjacentDomino2 = stab2.get(y - 2, x + 1);
                                                                        myTableaux.dualSignTabs.moveSign(signedDomino2, adjacentDomino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        let newDomino1 = stab1.get(x + 1, y);
                                                                        myTableaux.makeSpaceFor(newDomino1);
                                                                        myTableaux.addNumberSign(number, sign2, x + 2);
                                                                } else {
                                                                        domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                        domino2 = {n: opSign2, x: y - 1, y: x + 1, horiz: true};
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        myTableaux.changeBoxSigns(domino2, sign2);
                                                                        myTableaux.addNumberSign(number, sign2, x + 2);
                                                                }
                                                        }

                                                        continue;
                                                }

                                                if (topSign1 != "") {
                                                        sign1 = topSign1;
                                                } else if (upColSignData1) {
                                                        if (upColSignData1.sign != "") {
                                                                sign1 = upColSignData1.sign;
                                                        }
                                                }

                                                opSign1 = oppositeSign(sign1);
                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                domino2 = {n: "", x: y, y: x, horiz: false};
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                        }

                                        myTableaux.addNumberSign(number, oppositeSign(sign1), y + 1);
                                }

                                else if ((gridPos == "Z" && pos.horiz) && (dGridPos == "Z" && dpos.horiz)){
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let testSign = myTableaux.dualSignTabs.stab.getSign(pos.x - 1, pos.y - 1);
                                        if (testSign == "") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1); // it's going into a box, so its sign doesn't matter
                                        let domino2 = new Domino(pos2); // it's going into a box, so its sign doesn't matter
                                        let cornerDomino1 = stab1.get(x - 1, y - 1);
                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                        let opSign2 = oppositeSign(sign2);
                                        let rowSignData = stab1.findSignInRowRight(y - 1, x + 1);
                                        let sign1;
                                        if (rowSignData.sign != "") {
                                                sign1 = rowSignData.sign;
                                        }

                                        if (sign1) {
                                                let aboveColumn = rowSignData.column;
                                                let signedDomino1 = stab1.get(aboveColumn, y - 1);
                                                if (stab1.isBottomCorner(signedDomino1)) {
                                                        // we may need to remove sign2 from the column above this domino
                                                        let colAboveSignData = stab2.findSignInRowLeft(aboveColumn, y - 3);
                                                        if (colAboveSignData.sign == sign2) {
                                                                let problemDomino2 = stab2.get(colAboveSignData.column, aboveColumn);
                                                                myTableaux.switchSignDown(problemDomino2);
                                                        }
                                                }

                                                let blankDomino2 = stab2.get(y - 1, aboveColumn);
                                                if (stab2.isCycleTop(blankDomino2)) {
                                                        myTableaux.putSignInCycleTop(blankDomino2, sign2);
                                                }

                                                domino1.n = "";
                                                signedDomino1.n = "";
                                                domino2.n = oppositeSign(sign2);
                                                blankDomino2.n = sign2;
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // no sign1 found
                                                domino1.n = "";
                                                domino2.n = oppositeSign(sign2);
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                                myTableaux.addNumberSign(number, sign2, x + 1);
                                        }
                                }

                                else if ((gridPos == "Z" && pos.horiz && dGridPos == "X")
                                                || (dGridPos == "Z" && dpos.horiz && gridPos == "X")) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        if (gridPos == "Z") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1); //it's going into a box, so its sign doesn't matter
                                        let domino2 = new Domino(pos2); //it's going into a box, so its sign doesn't matter

                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                        if (sign2 != "") {
                                                //TODO shape change
                                                let row = myTableaux.findRowAddSignX(sign2, y, x - 1);
                                                if (row > x - 1) {
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        stab1.makeBox(domino1);
                                                        stab2.makeBox(domino2);
                                                        myTableaux.addNumberSign(number, sign2, row);
                                                        continue;
                                                }

                                        }

                                        let sign1 = stab1.getSign(x - 1, y - 1);
                                        stab1.putDomino(domino1);
                                        stab2.putDomino(domino2);
                                        stab1.makeBox(domino1);
                                        stab2.makeBox(domino2);
                                        myTableaux.addNumberSign(number, sign1, y + 1);
                                }

                                else if ((gridPos == "Z" && pos.horiz && dGridPos == "Z" && myTableaux.dualSignTabs.stab.get(pos.x - 1, pos.y - 1).horiz)
                                                || (dGridPos == "Z" && dpos.horiz && gridPos == "Z" && myTableaux.dualSignTabs.dstab.get(dpos.x - 1, dpos.y - 1).horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        // In this case, pairDomino1 is horizontal.
                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);

                                        let signData = stab1.findSignInRowRight(y - 1, x - 1);
                                        if (signData.sign != "") {
                                                let sign1 = signData.sign;
                                                let opSign1 = oppositeSign(sign1);
                                                let adjacentSign1 = stab1.getSign(x - 2, y);
                                                let pairDomino1 = stab1.get(x - 1, y - 1);
                                                let pairDomino2 = stab2.get(y - 1, x - 1);
                                                let domino1 = new Domino(pos1);
                                                let domino2 = new Domino(pos2);
                                                if (pairDomino1.n == "") {
                                                        // then adjacentDomino1.n == "" also
                                                        let lastDomino1 = stab1.get(signData.column, y - 1);
                                                        let lastDomino2 = stab2.get(y - 1, signData.column);
                                                        let sign2 = pairDomino2.n;
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (lastDomino2.horiz) {
                                                                if (stab2.isCycleTop(lastDomino2)) {
                                                                        myTableaux.putSignInCycleTop(lastDomino2, sign2);
                                                                } else {
                                                                        myTableaux.makeSpaceFor(lastDomino2, sign2);
                                                                }
                                                        }

                                                        domino1.n = "";
                                                        lastDomino1.n = "";
                                                        lastDomino2.n = sign2;
                                                        domino2.n = opSign2;
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);

                                                } else { // pairDomino.n == sign1
                                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                domino2.n = "";
                                                        } else { // adjacentSign1 == ""
                                                                let sign2 = stab2.getSign(y, x - 2);
                                                                domino1.n = "";
                                                                pairDomino1.n = "";
                                                                domino2.n = sign2;
                                                                pairDomino2.n = oppositeSign(sign2);
                                                        }

                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (topDomino1.n == "") {
                                                                let sideDomino2 = stab2.get(y - 1, x + 1);
                                                                let shapeChange = myTableaux.putSignInCycleBottom(sideDomino2, sideDomino2.n, opSign1);
                                                                if (shapeChange) {
                                                                        domino1.x -= 1;
                                                                        domino2.y -= 1;
                                                                }
                                                        }
                                                }

                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // signData.sign == ""
                                                let pairSign2 = stab2.getSign(y - 1, x - 1);
                                                domino1.n = "";
                                                domino2.n = oppositeSign(pairSign2);
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, pairSign2, stab2.getColumnLength(y - 1));
                                        }

                                }

                                else if ((gridPos == "Z" && pos.horiz) || (dGridPos == "Z" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let side;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                side = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                side = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let forwardSquare = tab1.getForwardSquare({x: x + 1, y: y});
                                        let backSquare = tab1.getBackSquare({x: x, y : y + 1});
                                        let open = false;
                                        if (forwardSquare.y != y + 1) {
                                                open = true;
                                        }

                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);
                                        let cornerDomino1 = stab1.get(x - 1, y - 1);
                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                        if (cornerDomino1.n != "" && topDomino1.n != "") {
                                                let sign1 = cornerDomino1.n;
                                                let opSign1 = oppositeSign(sign1);
                                                let rowAddSign = myTableaux.findRowAddSignX(sign1, x, y - 1);
                                                if (rowAddSign > y - 1) {
                                                        // all sign1 in the column
                                                        domino1.n = opSign1;
                                                        domino2.n = "";
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                        		let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                        		let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }

                                                        myTableaux.addNumberSign(number, sign1, rowAddSign);
                                                } else {
                                                        // We've pulled up a blank.
                                                        // We'll make the box here.
                                                        // The first signs don't matter, since we're making a box.
                                                        domino1.n = "";
                                                        domino2.n = "";
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                        domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                        domino2 = new Domino({n: sign2, x: y + 1, y: x, horiz: false});
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        stab1.makeBox(domino1);
                                                        stab2.makeBox(domino2);
                                                        domino1.n = number;
                                                        domino2.n = number;
                                                        tab1.insertAtEnd(domino1);
                                                        tab2.insertAtEnd(domino2);
                                                        myTableaux.makeSpaceFor(stab2.get(y + 1, x + 1));
                                                }
                                        }

                                        else if (cornerDomino1.n != "" && topDomino1.n == "") {
                                                let sign1 = cornerDomino1.n;
                                                let rowAddSign1 = myTableaux.findRowAddSignX(sign1, x, y - 1);
                                                if (rowAddSign1 > y - 1) {
                                                        domino1.n = "";
                                                        cornerDomino1.n = "";
                                                        let sign2 = stab2.getSign(y - 1, x + 1);
                                                        domino2.n = oppositeSign(sign2);
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        cornerDomino2.n = sign2;
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                        		let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                        		let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }
                                                        myTableaux.addNumberSign(number, sign1, rowAddSign1);
                                                }  else { // rowAddSign1 == y - 1
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        let sideDomino2 = stab2.get(y - 1, x + 1);
                                                        let sign2 = sideDomino2.n;
                                                        if (cornerDomino2.n != sign2) {
                                                                // So, temporarily we have an illegitimate tableau.
                                                                // But, we're going to make a box, so it doesn't matter.
                                                                domino1.n = "";
                                                                domino2.n = "";
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                let sign2 = stab2.getSign(y - 1, x + 1);
                                                                domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                                domino2 = new Domino({n: oppositeSign(sign2), x: y + 1, y: x, horiz: false});
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                domino1.n = number;
                                                                domino2.n = number;
                                                                tab1.insertAtEnd(domino1);
                                                                tab2.insertAtEnd(domino2);
                                                        } else { // cornerDomino2.n == sign2
                                                                let rowAddSign2 = myTableaux.findRowAddSignX(sign2, y, x + 1);
                                                                if (rowAddSign2 > x + 1) {
                                                                        domino1.n = "";
                                                                        domino2.n = oppositeSign(sign2);
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        if (open) {
                                                                                let message = number + " " + side + " " + sign2 + " back square: " + (x + 1).toString() + " " + y;
                                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                                // console.log(message);
                                                                                if (forwardSquare.y > y) {
                                                                                        let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                                        myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                                } else {
                                                                                        let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                                        myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                                }
                                                                        }

                                                                        myTableaux.addNumberSign(number, sign2, rowAddSign2);
                                                                } else {
                                                                        // As above.
                                                                        // We'll make the box here.
                                                                        // The first signs don't matter, since we're making a box.
                                                                        domino1.n = "";
                                                                        domino2.n = "";
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                                        domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                                        domino2 = new Domino({n: sign2, x: y + 1, y: x, horiz: false});
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        if (open) {
                                                                                if (tab1.dominoGrid.get(x, y + 1)) {
                                                                                        domino1 = new Domino({n: "", x: x + 1, y: y, horiz: false});
                                                                                        domino2 = new Domino({n: "", x: y, y: x + 1, horiz: true});
                                                                                        tab1.moveOpenCycle({x: x + 1, y: y});
                                                                                        tab2.moveOpenCycle({x: y, y: x + 1});
                                                                                }
                                                                        }
                                                                        domino1.n = number;
                                                                        domino2.n = number;
                                                                        tab1.insertAtEnd(domino1);
                                                                        tab2.insertAtEnd(domino2);
                                                                        myTableaux.makeSpaceFor(stab2.get(y + 1, x + 1));
                                                                }
                                                        }
                                                }
                                        }

                                        else {// cornerDomino1.n == ""
                                                let signData = stab1.findSignInRowRight(y - 1, x + 1);
                                                if (signData.sign != "") {
                                                        let sign1 = signData.sign;
                                                        let rightDomino1 = stab1.get(signData.column, y - 1);
                                                        let downDomino2 = stab2.get(y - 1, signData.column);
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        let sign2 = cornerDomino2.n;
                                                        myTableaux.prepareForSign(downDomino2, sign2);
                                                        domino1.n = "";
                                                        rightDomino1.n = "";
                                                        domino2.n = oppositeSign(sign2);
                                                        downDomino2.n = sign2;

                                                        if (open) {
                                                                if (tab1.dominoGrid.get(x, y + 1)) {
                                                                        tab1.moveOpenCycle({x: x + 1, y: y});
                                                                        tab2.moveOpenCycle({x: y, y: x + 1});
                                                                        domino1 = new Domino({n: "", x: x, y: y, horiz: false});
                                                                        domino2 = new Domino({n: "", x: y, y: x, horiz: true});
                                                                        let sideDomino1 = stab1.get(x - 1, y + 1);
                                                                        let sideSign1 = sideDomino1.n;
                                                                        if (sideSign1 != "") {
                                                                                cornerDomino1.n = sideSign1;
                                                                                domino1.n = oppositeSign(sideSign1);
                                                                                cornerDomino2.n = "";
                                                                                domino2.n = "";
                                                                        }
                                                                }
                                                        }

                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);

                                                        let rowAddSign1 = myTableaux.findRowAddSignX(sign1, x, y + 1);
                                                        if (rowAddSign1 > y + 1) {
                                                                if (open) {
                                                                        let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                        message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                        message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                        // console.log(message);
                                                                        //TODO check this new Code
                                                                        if (forwardSquare.y > y) {
                                                                                let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                                myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                        } else {
                                                                                let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                                myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                        }
                                                                }

                                                                myTableaux.addNumberSign(number, sign1, rowAddSign1);
                                                        } else { //rowAddSign1 == y + 1
                                                                domino1 = new Domino({n: sign1, x: x, y: y + 1, horiz: true});
                                                                domino2 = new Domino({n: "", x: y + 1, y: x, horiz: false});
                                                                if (open) {
                                                                        if (tab1.dominoGrid.get(x, y + 1)) {
                                                                                domino1 = new Domino({n: sign1, x: x + 1, y: y, horiz: false});
                                                                                domino2 = new Domino({n: "", x: y, y: x + 1, horiz: true});
                                                                        }
                                                                }

                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                domino1.n = number;
                                                                domino2.n = number;
                                                                tab1.insertAtEnd(domino1);
                                                                tab2.insertAtEnd(domino2);
                                                        }
                                                } else { // signData.sign == "", that is, no sign in top row
                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                        domino1.n = "";
                                                        domino2.n = oppositeSign(sign2);
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        let colLength = stab2.getColumnLength(y - 1);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign2 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                                        let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                        myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                                        let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                        myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }
                                                        myTableaux.addNumberSign(number, sign2, colLength);
                                                }
                                        }
                                }

                                else if ((gridPos == "W" && pos.horiz) || (dGridPos == "W" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);

                                        let signData = stab1.findSignInRowRight(y - 1, x);
                                        if (signData.sign != "") {
                                                let sign1 = signData.sign;
                                                let opSign1 = oppositeSign(sign1);
                                                let adjacentSign1 = stab1.getSign(x - 1, y);
                                                let pairDomino1 = stab1.get(x, y - 1);
                                                let pairDomino2 = stab2.get(y - 1, x);
                                                if (pairDomino1.n == "") {
                                                        let lastDomino1 = stab1.get(signData.column, y - 1);
                                                        let lastDomino2 = stab2.get(y - 1, signData.column);
                                                        let sign2 = pairDomino2.n;
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (lastDomino2.horiz) {
                                                                if (stab2.isCycleTop(lastDomino2)) {
                                                                        myTableaux.putSignInCycleTop(lastDomino2, sign2);
                                                                } else {
                                                                        myTableaux.makeSpaceFor(lastDomino2, sign2);
                                                                }
                                                        }

                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                pairDomino1.n = sign1;
                                                                lastDomino1.n = "";
                                                                domino2.n = "";
                                                                pairDomino2.n = "";
                                                                lastDomino2.n = sign2;
                                                        } else if (adjacentSign1 == "") {
                                                                domino1.n = "";
                                                                lastDomino1.n = "";
                                                                lastDomino2.n = sign2;
                                                                domino2.n = opSign2;
                                                        } else { // adjacentSign1 == opSign1
                                                                domino1.n = sign1;
                                                                pairDomino1.n = opSign1;
                                                                lastDomino1.n = "";
                                                                domino2.n = "";
                                                                pairDomino2.n = "";
                                                                lastDomino2.n = sign2;
                                                        }

                                                } else { // pairDomino.n == sign1
                                                        let topDomino1 = stab1.get(x + 2, y - 1);
                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                domino2.n = "";
                                                        } else { // adjacentSign1 == ""
                                                                let sign2 = stab2.getSign(y, x - 1);
                                                                domino1.n = "";
                                                                pairDomino1.n = "";
                                                                domino2.n = sign2;
                                                                pairDomino2.n = oppositeSign(sign2);
                                                        }

                                                        if (topDomino1.n == "") {
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                let sideDomino2 = stab2.get(y - 1, x + 2);
                                                                myTableaux.putSignInCycleBottom(sideDomino2, sideDomino2.n, opSign1);
                                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                                                continue;
                                                        }
                                                }

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // signData.sign == ""
                                                let pairSign2 = stab2.getSign(y - 1, x);
                                                let adjacentSign1 = stab1.getSign(x - 1, y);
                                                if (adjacentSign1 == "") {
                                                        domino1.n = "";
                                                        domino2.n = oppositeSign(pairSign2);
                                                } else { // adjacentSign1 == ""
                                                        let pairDomino2 = stab2.get(y - 1, x);
                                                        let pairDomino1 = stab1.get(x, y - 1);
                                                        pairDomino2.n = "";
                                                        domino2.n = "";
                                                        pairDomino1.n = adjacentSign1;
                                                        domino1.n = oppositeSign(adjacentSign1);
                                                }

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, pairSign2, stab2.getColumnLength(y - 1));
                                        }
                                }
                        }
                }

                return myTableaux;
        }

        static SOpqEvenRobSDraw(parameter) {
                let myTableaux = new Tableaux();
                for (let number = 1; number < parameter.length; ++number) {
                        let info = parameter[number];
                        if (info == "+" || info == "-" || info == "s" || info == "t") {
                                displayText(number + info);
                                myTableaux.addNumberSign(number, info, 0);
                                myTableaux.draw();
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                if (parameter[first] == 0) {
                                        displayText(first + "_" + number);
                                } else {
                                        displayText(first + "_-" + number);
                                }

                                let previousTableaux = myTableaux.clone();
                                let rsNumber = parameter[first] == 0 ? first : -first;
                                let posData = myTableaux.dualTabs.addRS(rsNumber);
                                let pos = posData.pos;
                                let dpos = posData.dpos;
                                let leftTabsToDraw = myTableaux.dualTabs.clone();
                                let posDomino = new Domino(pos);
                                posDomino.n = "";
                                posDomino.highlight = 5;
                                let dposDomino = new Domino(dpos);
                                dposDomino.n = "";
                                dposDomino.highlight = 5;
                                leftTabsToDraw.tab.dominoList.push(posDomino);
                                leftTabsToDraw.dtab.dominoList.push(dposDomino);
                                previousTableaux.dualTabs = leftTabsToDraw;

                                previousTableaux.dualSignTabs.stab.tableau.dominoList.push(posDomino);
                                previousTableaux.dualSignTabs.dstab.tableau.dominoList.push(dposDomino);
                                previousTableaux.draw();

                                let gridPos = getGridSubPos(pos);
                                let dGridPos = getGridSubPos(dpos);

                                if ((gridPos == "Y" && pos.horiz) || (dGridPos == "Y" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let signChoice;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                signChoice = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                signChoice = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;

                                        let rowLength = stab1.getRowLength(y + 1);
                                        // make a new up cycle
                                        if (rowLength == x) {
                                                let domino1 = new Domino({n: number, x: x, y: y + 1, horiz: true});
                                                let domino2 = new Domino({n: number, x: y + 1, y: x, horiz: false});
                                                tab1.insertAtEnd(domino1);
                                                tab2.insertAtEnd(domino2);
                                                stab1.putBox(x, y);
                                                stab1.moveBoxUp(x, y);
                                                stab2.putBox(y, x);
                                                stab2.moveBoxUp(y, x);
                                        }
                                        // contract a down cycle
                                        else {
                                                let domino1 = new Domino(pos1);
                                                let domino2 = new Domino(pos2);
                                                let sign1;
                                                let sideDomino1 = stab1.get(x - 2, y);
                                                let sideSign1 = sideDomino1.n;
                                                let topDomino1 = stab1.get(x, y - 2);
                                                let topSign1 = topDomino1.n;
                                                if (sideSign1 != "") {
                                                        sign1 = oppositeSign(sideSign1);
                                                }

                                                // henceforth sideSign1 == ""
                                                else if (topSign1 != "") {
                                                        sign1 = topSign1;
                                                }

                                                // henceforth topSign1 == ""
                                                else {
                                                        let cycleTop = stab1.getTopDomino(sideDomino1);
                                                        if (cycleTop.n != "") {
                                                                // TODO new code
                                                                sign1 = SignTableau.getExpectedSign(cycleTop, topDomino1);
                                                        } else {
                                                                sign1 = signChoice;
                                                        }

                                                }

                                                let opSign1 = oppositeSign(sign1);
                                                if (sideSign1 == "") {
                                                        myTableaux.putSignInCycleBottom(sideDomino1, opSign1);
                                                }

                                                domino1.n = sign1;
                                                domino2.n = "";

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);

                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);

                                                // TODO think this over
                                                if (sideDomino1.horiz && sideDomino1.n == "") {
                                                        let newDomino1 =  stab1.get(domino1.x, domino1.y);
                                                        myTableaux.makeSpaceFor(newDomino1);
                                                }

                                                myTableaux.addNumberSign(number, opSign1, y + 1);
                                        }

                                }

                                else if (gridPos == "Y" && dGridPos == "Y") { // !pos.horiz and !dpos.horiz
                                        let x = pos.x;
                                        let y = pos.y;
                                        let domino = new Domino({n: number, x: x + 1, y: y, horiz: false});
                                        let dualDomino = new Domino({n: number, x: y + 1, y: x, horiz: false})
                                        myTableaux.dualTabs.tab.insertAtEnd(domino);
                                        myTableaux.dualTabs.dtab.insertAtEnd(dualDomino);
                                        myTableaux.dualSignTabs.stab.putBox(x, y);
                                        myTableaux.dualSignTabs.stab.moveBoxUp(x, y);
                                        myTableaux.dualSignTabs.dstab.putBox(y, x);
                                        myTableaux.dualSignTabs.dstab.moveBoxUp(y, x);
                                }

                                else if ((gridPos == "X" && !pos.horiz) && (dGridPos == "X" && !dpos.horiz)){
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let testSign = myTableaux.dualSignTabs.stab.getSign(pos.x - 1, pos.y);
                                        let sign;
                                        if (testSign != "") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                sign = testSign;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                sign = stab1.getSign(pos1.x - 1, pos1.y);
                                        }

                                        let x = pos1.x - 1;
                                        let y = pos1.y;
                                        stab1.putBox(x, y);
                                        stab1.moveBoxUp(x, y);
                                        stab2.putBox(y, x);
                                        stab2.moveBoxUp(y, x);
                                        myTableaux.addNumberSign(number, sign, y + 2);
                                }

                                else if ((gridPos == "X" && pos.horiz) || (dGridPos == "X" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let signChoice;
                                        if (gridPos == "X") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                signChoice = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                signChoice = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1;
                                        let domino2;

                                        let signData = stab1.findSignInRowLeft(y, x - 1);
                                        let currentColumn1 = signData.column;
                                        let currentDomino1 = stab1.get(currentColumn1, y);
                                        let adjacentDomino1 = stab1.get(x - 1, y);
                                        if (signData.sign != "" && adjacentDomino1.n == "") {
                                                // In this case currentDomino1 is a top corner
                                                // and we can move currentDomino1 down,
                                                // so we'll do it now.
                                                // We'll want it down anyway to add the second domino.
                                                // Moving it now makes the choice of sign1,
                                                // and the code to handle it, easier here.
                                                //  TODO maybe not, this will disturb the invariant
                                                // change this to use makeSpaceFor lower down?
                                                let currentDomino2 = stab2.get(y, currentColumn1);
                                                myTableaux.switchInRow(currentDomino2, stab2.getSign(y, x - 1));
                                        }

                                        // TODO We also need to move adjacentDomino1 down if it has a sign in it
                                        // and there's another sign available in its column
                                        // maybe not

                                        let sign1 = signChoice;
                                        if (adjacentDomino1.n != "") { // so, adjacentDomino1.n == signData.sign
                                                sign1 = oppositeSign(adjacentDomino1.n);
                                        }

                                        let upperLeft = y == 0 ? null : stab1.get(x - 1, y - 1);
                                        let upperRight = y == 0 ? null : stab1.get(x + 1, y - 1);
                                        // extend boxed up cycle
                                        if (y == 0 || upperRight.n == "*" || (upperLeft.horiz && stab1.getRowLength(y - 1) > x + 2)) { // extend up cycle
                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                stab1.putDomino(domino1);
                                                domino2 = {n: "", x: y, y: x + 1, horiz: false};
                                                stab2.putDomino(domino2);
                                        }

                                        else if (stab1.getRowLength(y - 1) > x + 2) { // contract down cycle
                                                if (adjacentDomino1.n == "") {
                                                        let upDomino1 = stab1.get(x, y - 2);
                                                        let upSign1 = upDomino1.n;
                                                        if (upSign1 != "") {
                                                                sign1 = upSign1;
                                                        }
                                                }

                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                domino2 = {n: "", x: y, y: x, horiz: false};

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);

                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                        }

                                        else { // close down cycle
                                                let topDomino1 = stab1.get(x + 1, y - 2);
                                                let topSign1 = topDomino1.n;
                                                let upColSignData1;
                                                let shapeChange = false;
                                                // let sign2;
                                                let opSign1 = oppositeSign(sign1);
                                                if (stab1.isBottomCorner(topDomino1) && topSign1 == "") {
                                                        upColSignData1 = stab1.findSignInColumnAbove(x + 1, y - 4);
                                                }

                                                // If there's a vertical blank domino below, bring it up.
                                                // this is okay, since ultimately you're adding two dominos,
                                                // one of each sign.
                                                if (adjacentDomino1.n == opSign1) { //&& stab1.getColumnLength(x - 1) > y + 2)
                                                        // In the situation just below, there will be a shape change,
                                                        // and we'll be adding the horizontal domino on side 2
                                                        // So, we'll want a blank domino for adjacentDomino2
                                                        // We'll get it here.
                                                        // Looking on side 1, we need to bring the sign in before moving a blank up
                                                        if (topSign1 == "") {
                                                                let topRowSignData1 = stab1.findSignInRowRight(y - 2, x + 1);
                                                                let topRowSignData2 = stab2.findSignInRowRight(x - 1, y);
                                                                let adjacentSign2 = stab2.getSign(y - 2, x + 1);
                                                                if (topRowSignData2.sign == adjacentSign2 && topRowSignData1.sign != "") {
                                                                       myTableaux.switchInRow(topDomino1, topRowSignData1.sign);
                                                               }
                                                        }

                                                        let rowAddSign;
                                                        if (!adjacentDomino1.horiz) {
                                                                rowAddSign = myTableaux.findRowAddSignX(opSign1, x, y, true);
                                                        } else {
                                                                rowAddSign = y + 1;
                                                        }

                                                        if (rowAddSign > y) {
                                                                let cornerSign2 = stab2.getSign(y - 2, x - 1);
                                                                // We want to put sign1 in domino1.
                                                                // However, in this case, there's an opSign1 in the column above
                                                                // So, we want to pull the opSign1 down.
                                                                // However, that will put us in the funny situation.
                                                                // This is okay, except sometimes the resolution of the funny situation
                                                                // causes a clash with a sign in the up column on side 2.
                                                                // So, we need to check for that, and, in that case,
                                                                //  we need to pull that up sign down on side 2.
                                                                // Once we've done that, adjacentDomino1 will be blank,
                                                                // and we can move the sign1 from domino1 left into adjacentDomino1.
                                                                if (upColSignData1 && upColSignData1.sign == opSign1) {
                                                                        let topDomino2 =  stab2.get(y, x - 1);
                                                                        if (stab2.isBottomCorner(topDomino2)) {
                                                                                let upColSignData2 = stab2.findSignInColumnAbove(y, x - 3);
                                                                                let sign2 = upColSignData2.sign;
                                                                                if (sign2 == oppositeSign(cornerSign2)) {
                                                                                        myTableaux.switchInColumn(topDomino2, sign2);
                                                                                        domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                                                        domino2 = {n: "", x: y, y: x, horiz: false};
                                                                                        stab1.putDomino(domino1);
                                                                                        stab2.putDomino(domino2);
                                                                                        let signedDomino1 = stab1.get(x + 1, y);
                                                                                        myTableaux.dualSignTabs.moveSign(signedDomino1, adjacentDomino1);
                                                                                        stab1.makeBox(domino1);
                                                                                        stab2.makeBox(domino2);
                                                                                        let newDomino2 = stab2.get(y, x + 1);
                                                                                        myTableaux.makeSpaceFor(newDomino2);
                                                                                        myTableaux.addNumberSign(number, oppositeSign(sign1), rowAddSign);
                                                                                        myTableaux.draw();
                                                                                        continue;
                                                                                }
                                                                        }

                                                                        myTableaux.switchInColumn(topDomino1, opSign1);
                                                                }

                                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                                domino2 = {n: "", x: y, y: x, horiz: false};

                                                                // This is the funny situation
                                                                if (topDomino1.n == opSign1) {
                                                                        // The funny situation gives us three signed dominos on side 1,
                                                                        // two with opSign1 and one with sign1.
                                                                        // We can conglomerate them into one opSign1 domino
                                                                        // by extracting the two signs on side2
                                                                        // which are contained in the funny situation.
                                                                       // However, sometimes you can't do this.
                                                                       // changeBoxSign could put a domino on side 2 into a column
                                                                       // with its oppositeSign above it.
                                                                       // In this case, pull the sign down first.
                                                                       if (stab1.isBottomCorner(adjacentDomino1)) {
                                                                               let upColSignData2 = stab2.findSignInColumnAbove(y, x - 3);
                                                                               let sign2 = upColSignData2.sign;
                                                                               let cornerSign2 = stab2.getSign(y - 2, x - 1);
                                                                               if (sign2 == oppositeSign(cornerSign2)) {
                                                                                       let topDomino2 =  stab2.get(y, x - 1);
                                                                                       myTableaux.switchInColumn(topDomino2, sign2);
                                                                                       stab1.putDomino(domino1);
                                                                                       stab2.putDomino(domino2);
                                                                                       let signedDomino1 = stab1.get(x + 1, y);
                                                                                       stab1.makeBox(domino1);
                                                                                       stab2.makeBox(domino2);
                                                                                       myTableaux.dualSignTabs.moveSign(signedDomino1, adjacentDomino1);
                                                                                       let newDomino2 = stab2.get(y, x + 1);
                                                                                       myTableaux.makeSpaceFor(newDomino2);
                                                                               } else {
                                                                                       stab1.putDomino(domino1);
                                                                                       stab2.putDomino(domino2);
                                                                                       myTableaux.changeBoxSigns(pos1, opSign1);
                                                                               }
                                                                       } else {
                                                                               stab1.putDomino(domino1);
                                                                               stab2.putDomino(domino2);
                                                                               myTableaux.changeBoxSigns(pos1, opSign1);
                                                                       }

                                                                } else if (topDomino1.n == "") {
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        // TODO check later if need the AddX
                                                                        myTableaux.switchAfterAddX(stab1.get(x + 1, y));
                                                                } else { // topDomino1.n == sign1
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                }

                                                                myTableaux.addNumberSign(number, oppositeSign(sign1), rowAddSign);
                                                                myTableaux.draw();
                                                                continue;
                                                        }

                                                        if (rowAddSign == -1) {
                                                                shapeChange = true;
                                                        }
                                                }

                                                if (shapeChange) {
                                                        let adjacentSign2 = stab2.getSign(y - 2, x + 1);
                                                        let sign2 = stab2.getSign(y, x - 1);
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (adjacentSign2 == "") {
                                                                domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                domino2 = {n: sign2, x: y - 1, y: x + 1, horiz: true};
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                let newDomino2 = stab2.get(y, x + 1);
                                                                myTableaux.makeSpaceFor(newDomino2);
                                                                myTableaux.addNumberSign(number, opSign2, x + 2);

                                                        } else { // adjacentSign2 == sign2, funny situation
                                                                if (upColSignData1 && upColSignData1.sign == opSign1) {
                                                                        myTableaux.switchInColumn(topDomino1, opSign1);
                                                                        domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                        domino2 = {n: opSign2, x: y - 1, y: x + 1, horiz: true};
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        let signedDomino2 = stab2.get(y, x + 1);
                                                                        let adjacentDomino2 = stab2.get(y - 2, x + 1);
                                                                        myTableaux.dualSignTabs.moveSign(signedDomino2, adjacentDomino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        let newDomino1 = stab1.get(x + 1, y);
                                                                        myTableaux.makeSpaceFor(newDomino1);
                                                                        myTableaux.addNumberSign(number, sign2, x + 2);
                                                                } else {
                                                                        domino1 = {n: "", x: x + 1, y: y - 1, horiz: false};
                                                                        domino2 = {n: opSign2, x: y - 1, y: x + 1, horiz: true};
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        myTableaux.changeBoxSigns(domino2, sign2);
                                                                        myTableaux.addNumberSign(number, sign2, x + 2);
                                                                }
                                                        }

                                                        myTableaux.draw();
                                                        continue;
                                                }

                                                if (topSign1 != "") {
                                                        sign1 = topSign1;
                                                } else if (upColSignData1) {
                                                        if (upColSignData1.sign != "") {
                                                                sign1 = upColSignData1.sign;
                                                        }
                                                }

                                                // opSign1 = oppositeSign(sign1);
                                                domino1 = {n: sign1, x: x, y: y, horiz: true};
                                                domino2 = {n: "", x: y, y: x, horiz: false};
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                        }

                                        myTableaux.addNumberSign(number, oppositeSign(sign1), y + 1);
                                }

                                else if ((gridPos == "Z" && pos.horiz) && (dGridPos == "Z" && dpos.horiz)){
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let testSign = myTableaux.dualSignTabs.stab.getSign(pos.x - 1, pos.y - 1);
                                        if (testSign == "") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1); // it's going into a box, so its sign doesn't matter
                                        let domino2 = new Domino(pos2); // it's going into a box, so its sign doesn't matter
                                        let cornerDomino1 = stab1.get(x - 1, y - 1);
                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                        let opSign2 = oppositeSign(sign2);
                                        let rowSignData = stab1.findSignInRowRight(y - 1, x + 1);
                                        let sign1;
                                        if (rowSignData.sign != "") {
                                                sign1 = rowSignData.sign;
                                        }

                                        if (sign1) {
                                                let aboveColumn = rowSignData.column;
                                                let signedDomino1 = stab1.get(aboveColumn, y - 1);
                                                if (stab1.isBottomCorner(signedDomino1)) {
                                                        // we may need to remove sign2 from the column above this domino
                                                        let colAboveSignData = stab2.findSignInRowLeft(aboveColumn, y - 3);
                                                        if (colAboveSignData.sign == sign2) {
                                                                let problemDomino2 = stab2.get(colAboveSignData.column, aboveColumn);
                                                                myTableaux.switchSignDown(problemDomino2);
                                                        }
                                                }

                                                let blankDomino2 = stab2.get(y - 1, aboveColumn);
                                                if (stab2.isCycleTop(blankDomino2)) {
                                                        myTableaux.putSignInCycleTop(blankDomino2, sign2);
                                                }

                                                domino1.n = "";
                                                signedDomino1.n = "";
                                                domino2.n = oppositeSign(sign2);
                                                blankDomino2.n = sign2;
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // no sign1 found
                                                domino1.n = "";
                                                domino2.n = oppositeSign(sign2);
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                stab1.makeBox(domino1);
                                                stab2.makeBox(domino2);
                                                myTableaux.addNumberSign(number, sign2, x + 1);
                                        }
                                }

                                else if ((gridPos == "Z" && pos.horiz && dGridPos == "X") || (dGridPos == "Z" && dpos.horiz && gridPos == "X")) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        if (gridPos == "Z") {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1); //it's going into a box, so its sign doesn't matter
                                        let domino2 = new Domino(pos2); //it's going into a box, so its sign doesn't matter

                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                        if (sign2 != "") {
                                                //TODO shape change
                                                let row = myTableaux.findRowAddSignX(sign2, y, x - 1);
                                                if (row > x - 1) {
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        stab1.makeBox(domino1);
                                                        stab2.makeBox(domino2);
                                                        myTableaux.addNumberSign(number, sign2, row);
                                                        myTableaux.draw();
                                                        continue;
                                                }

                                        }

                                        let sign1 = stab1.getSign(x - 1, y - 1);
                                        stab1.putDomino(domino1);
                                        stab2.putDomino(domino2);
                                        stab1.makeBox(domino1);
                                        stab2.makeBox(domino2);
                                        myTableaux.addNumberSign(number, sign1, y + 1);
                                }

                                else if ((gridPos == "Z" && pos.horiz && dGridPos == "Z" && myTableaux.dualSignTabs.stab.get(pos.x - 1, pos.y - 1).horiz) || (dGridPos == "Z" && dpos.horiz && gridPos == "Z" && myTableaux.dualSignTabs.dstab.get(dpos.x - 1, dpos.y - 1).horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        // In this case, pairDomino1 is horizontal.
                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);

                                        let signData = stab1.findSignInRowRight(y - 1, x - 1);
                                        if (signData.sign != "") {
                                                let sign1 = signData.sign;
                                                let opSign1 = oppositeSign(sign1);
                                                let adjacentSign1 = stab1.getSign(x - 2, y);
                                                let pairDomino1 = stab1.get(x - 1, y - 1);
                                                let pairDomino2 = stab2.get(y - 1, x - 1);
                                                // let domino1 = new Domino(pos1);
                                                // let domino2 = new Domino(pos2);
                                                if (pairDomino1.n == "") {
                                                        // then adjacentDomino1.n == "" also
                                                        let lastDomino1 = stab1.get(signData.column, y - 1);
                                                        let lastDomino2 = stab2.get(y - 1, signData.column);
                                                        let sign2 = pairDomino2.n;
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (lastDomino2.horiz) {
                                                                if (stab2.isCycleTop(lastDomino2)) {
                                                                        myTableaux.putSignInCycleTop(lastDomino2, sign2);
                                                                } else {
                                                                        myTableaux.makeSpaceFor(lastDomino2, sign2);
                                                                }
                                                        }

                                                        domino1.n = "";
                                                        lastDomino1.n = "";
                                                        lastDomino2.n = sign2;
                                                        domino2.n = opSign2;
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);

                                                } else { // pairDomino.n == sign1
                                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                domino2.n = "";
                                                        } else { // adjacentSign1 == ""
                                                                let sign2 = stab2.getSign(y, x - 2);
                                                                domino1.n = "";
                                                                pairDomino1.n = "";
                                                                domino2.n = sign2;
                                                                pairDomino2.n = oppositeSign(sign2);
                                                        }

                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (topDomino1.n == "") {
                                                                let sideDomino2 = stab2.get(y - 1, x + 1);
                                                                let shapeChange = myTableaux.putSignInCycleBottom(sideDomino2, sideDomino2.n, opSign1);
                                                                if (shapeChange) {
                                                                        domino1.x -= 1;
                                                                        domino2.y -= 1;
                                                                }
                                                        }
                                                }

                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // signData.sign == ""
                                                let pairSign2 = stab2.getSign(y - 1, x - 1);
                                                domino1.n = "";
                                                domino2.n = oppositeSign(pairSign2);
                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, pairSign2, stab2.getColumnLength(y - 1));
                                        }

                                }

                                else if ((gridPos == "Z" && pos.horiz) || (dGridPos == "Z" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        let side;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                                side = "+";
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                                side = "s";
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let forwardSquare = tab1.getForwardSquare({x: x + 1, y: y});
                                        let backSquare = tab1.getBackSquare({x: x, y : y + 1});
                                        let open = false;
                                        if (forwardSquare.y != y + 1) {
                                                open = true;
                                        }

                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);
                                        let cornerDomino1 = stab1.get(x - 1, y - 1);
                                        let topDomino1 = stab1.get(x + 1, y - 1);
                                        if (cornerDomino1.n != "" && topDomino1.n != "") {
                                                let sign1 = cornerDomino1.n;
                                                let opSign1 = oppositeSign(sign1);
                                                let rowAddSign = myTableaux.findRowAddSignX(sign1, x, y - 1);
                                                if (rowAddSign > y - 1) {
                                                        // all sign1 in the column
                                                        domino1.n = opSign1;
                                                        domino2.n = "";
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                        		let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                        		let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }

                                                        myTableaux.addNumberSign(number, sign1, rowAddSign);
                                                } else {
                                                        // We've pulled up a blank.
                                                        // We'll make the box here.
                                                        // The first signs don't matter, since we're making a box.
                                                        domino1.n = "";
                                                        domino2.n = "";
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                        domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                        domino2 = new Domino({n: sign2, x: y + 1, y: x, horiz: false});
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        stab1.makeBox(domino1);
                                                        stab2.makeBox(domino2);
                                                        domino1.n = number;
                                                        domino2.n = number;
                                                        tab1.insertAtEnd(domino1);
                                                        tab2.insertAtEnd(domino2);
                                                        myTableaux.makeSpaceFor(stab2.get(y + 1, x + 1));
                                                }
                                        }

                                        else if (cornerDomino1.n != "" && topDomino1.n == "") {
                                                let sign1 = cornerDomino1.n;
                                                let rowAddSign1 = myTableaux.findRowAddSignX(sign1, x, y - 1);
                                                if (rowAddSign1 > y - 1) {
                                                        domino1.n = "";
                                                        cornerDomino1.n = "";
                                                        let sign2 = stab2.getSign(y - 1, x + 1);
                                                        domino2.n = oppositeSign(sign2);
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        cornerDomino2.n = sign2;
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                        		let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                        		let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                        		myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }
                                                        myTableaux.addNumberSign(number, sign1, rowAddSign1);
                                                }  else { // rowAddSign1 == y - 1
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        let sideDomino2 = stab2.get(y - 1, x + 1);
                                                        let sign2 = sideDomino2.n;
                                                        if (cornerDomino2.n != sign2) {
                                                                // So, temporarily we have an illegitimate tableau.
                                                                // But, we're going to make a box, so it doesn't matter.
                                                                domino1.n = "";
                                                                domino2.n = "";
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                let sign2 = stab2.getSign(y - 1, x + 1);
                                                                domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                                domino2 = new Domino({n: oppositeSign(sign2), x: y + 1, y: x, horiz: false});
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                domino1.n = number;
                                                                domino2.n = number;
                                                                tab1.insertAtEnd(domino1);
                                                                tab2.insertAtEnd(domino2);
                                                        } else { // cornerDomino2.n == sign2
                                                                let rowAddSign2 = myTableaux.findRowAddSignX(sign2, y, x + 1);
                                                                if (rowAddSign2 > x + 1) {
                                                                        domino1.n = "";
                                                                        domino2.n = oppositeSign(sign2);
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        if (open) {
                                                                                let message = number + " " + side + " " + sign2 + " back square: " + (x + 1).toString() + " " + y;
                                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                                // console.log(message);
                                                                                if (forwardSquare.y > y) {
                                                                                        let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                                        myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                                } else {
                                                                                        let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                                        myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                                }
                                                                        }

                                                                        myTableaux.addNumberSign(number, sign2, rowAddSign2);
                                                                } else {
                                                                        // As above.
                                                                        // We'll make the box here.
                                                                        // The first signs don't matter, since we're making a box.
                                                                        domino1.n = "";
                                                                        domino2.n = "";
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                                        domino1 = new Domino({n: "", x: x, y: y + 1, horiz: true});
                                                                        domino2 = new Domino({n: sign2, x: y + 1, y: x, horiz: false});
                                                                        stab1.putDomino(domino1);
                                                                        stab2.putDomino(domino2);
                                                                        stab1.makeBox(domino1);
                                                                        stab2.makeBox(domino2);
                                                                        if (open) {
                                                                                if (tab1.dominoGrid.get(x, y + 1)) {
                                                                                        domino1 = new Domino({n: "", x: x + 1, y: y, horiz: false});
                                                                                        domino2 = new Domino({n: "", x: y, y: x + 1, horiz: true});
                                                                                        tab1.moveOpenCycle({x: x + 1, y: y});
                                                                                        tab2.moveOpenCycle({x: y, y: x + 1});
                                                                                }
                                                                        }
                                                                        domino1.n = number;
                                                                        domino2.n = number;
                                                                        tab1.insertAtEnd(domino1);
                                                                        tab2.insertAtEnd(domino2);
                                                                        myTableaux.makeSpaceFor(stab2.get(y + 1, x + 1));
                                                                }
                                                        }
                                                }
                                        }

                                        else {// cornerDomino1.n == ""
                                                let signData = stab1.findSignInRowRight(y - 1, x + 1);
                                                if (signData.sign != "") {
                                                        let sign1 = signData.sign;
                                                        let rightDomino1 = stab1.get(signData.column, y - 1);
                                                        let downDomino2 = stab2.get(y - 1, signData.column);
                                                        let cornerDomino2 = stab2.get(y - 1, x - 1);
                                                        let sign2 = cornerDomino2.n;
                                                        myTableaux.prepareForSign(downDomino2, sign2);
                                                        domino1.n = "";
                                                        rightDomino1.n = "";
                                                        domino2.n = oppositeSign(sign2);
                                                        downDomino2.n = sign2;

                                                        if (open) {
                                                                if (tab1.dominoGrid.get(x, y + 1)) {
                                                                        tab1.moveOpenCycle({x: x + 1, y: y});
                                                                        tab2.moveOpenCycle({x: y, y: x + 1});
                                                                        domino1 = new Domino({n: "", x: x, y: y, horiz: false});
                                                                        domino2 = new Domino({n: "", x: y, y: x, horiz: true});
                                                                        let sideDomino1 = stab1.get(x - 1, y + 1);
                                                                        let sideSign1 = sideDomino1.n;
                                                                        if (sideSign1 != "") {
                                                                                cornerDomino1.n = sideSign1;
                                                                                domino1.n = oppositeSign(sideSign1);
                                                                                cornerDomino2.n = "";
                                                                                domino2.n = "";
                                                                        }
                                                                }
                                                        }

                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);

                                                        let rowAddSign1 = myTableaux.findRowAddSignX(sign1, x, y + 1);
                                                        if (rowAddSign1 > y + 1) {
                                                                if (open) {
                                                                        let message = number + " " + side + " " + sign1 + " back square: " + (x + 1).toString() + " " + y;
                                                                        message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                        message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                        // console.log(message);
                                                                        //TODO check this new Code
                                                                        if (forwardSquare.y > y) {
                                                                                let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                                myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                        } else {
                                                                                let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                                myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                        }
                                                                }

                                                                myTableaux.addNumberSign(number, sign1, rowAddSign1);
                                                        } else { //rowAddSign1 == y + 1
                                                                domino1 = new Domino({n: sign1, x: x, y: y + 1, horiz: true});
                                                                domino2 = new Domino({n: "", x: y + 1, y: x, horiz: false});
                                                                if (open) {
                                                                        if (tab1.dominoGrid.get(x, y + 1)) {
                                                                                domino1 = new Domino({n: sign1, x: x + 1, y: y, horiz: false});
                                                                                domino2 = new Domino({n: "", x: y, y: x + 1, horiz: true});
                                                                        }
                                                                }

                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                stab1.makeBox(domino1);
                                                                stab2.makeBox(domino2);
                                                                domino1.n = number;
                                                                domino2.n = number;
                                                                tab1.insertAtEnd(domino1);
                                                                tab2.insertAtEnd(domino2);
                                                        }
                                                } else { // signData.sign == "", that is, no sign in top row
                                                        let sign2 = stab2.getSign(y - 1, x - 1);
                                                        domino1.n = "";
                                                        domino2.n = oppositeSign(sign2);
                                                        stab1.putDomino(domino1);
                                                        stab2.putDomino(domino2);
                                                        let colLength = stab2.getColumnLength(y - 1);
                                                        if (open) {
                                                                let message = number + " " + side + " " + sign2 + " back square: " + (x + 1).toString() + " " + y;
                                                                message += " forward square: " + forwardSquare.x + " " + forwardSquare.y;
                                                                message += " back square: " + backSquare.x + " " + backSquare.y;
                                                                // console.log(message);
                                                                if (forwardSquare.y > y) {
                                                                        let otherTopDomino1 = stab1.get(backSquare.x, backSquare.y - 1);
                                                                        myTableaux.openTwoCycles(otherTopDomino1, domino1, stab1, stab2, tab1, tab2);
                                                                } else {
                                                                        let otherTopDomino2 = stab2.get(forwardSquare.y, forwardSquare.x - 1);
                                                                        myTableaux.openTwoCycles(otherTopDomino2, domino2, stab2, stab1, tab2, tab1);
                                                                }
                                                        }
                                                        myTableaux.addNumberSign(number, sign2, colLength);
                                                }
                                        }
                                }

                                else if ((gridPos == "W" && pos.horiz) || (dGridPos == "W" && dpos.horiz)) {
                                        let pos1;
                                        let pos2;
                                        let stab1;
                                        let stab2;
                                        let tab1;
                                        let tab2;
                                        if (pos.horiz) {
                                                pos1 = pos;
                                                pos2 = dpos;
                                                stab1 = myTableaux.dualSignTabs.stab;
                                                stab2 = myTableaux.dualSignTabs.dstab;
                                                tab1 = myTableaux.dualTabs.tab;
                                                tab2 = myTableaux.dualTabs.dtab;
                                        } else {
                                                pos1 = dpos;
                                                pos2 = pos;
                                                stab1 = myTableaux.dualSignTabs.dstab;
                                                stab2 = myTableaux.dualSignTabs.stab;
                                                tab1 = myTableaux.dualTabs.dtab;
                                                tab2 = myTableaux.dualTabs.tab;
                                        }

                                        let x = pos1.x;
                                        let y = pos1.y;
                                        let domino1 = new Domino(pos1);
                                        let domino2 = new Domino(pos2);

                                        let signData = stab1.findSignInRowRight(y - 1, x);
                                        if (signData.sign != "") {
                                                let sign1 = signData.sign;
                                                let opSign1 = oppositeSign(sign1);
                                                let adjacentSign1 = stab1.getSign(x - 1, y);
                                                let pairDomino1 = stab1.get(x, y - 1);
                                                let pairDomino2 = stab2.get(y - 1, x);
                                                if (pairDomino1.n == "") {
                                                        let lastDomino1 = stab1.get(signData.column, y - 1);
                                                        let lastDomino2 = stab2.get(y - 1, signData.column);
                                                        let sign2 = pairDomino2.n;
                                                        let opSign2 = oppositeSign(sign2);
                                                        if (lastDomino2.horiz) {
                                                                if (stab2.isCycleTop(lastDomino2)) {
                                                                        myTableaux.putSignInCycleTop(lastDomino2, sign2);
                                                                } else {
                                                                        myTableaux.makeSpaceFor(lastDomino2, sign2);
                                                                }
                                                        }

                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                pairDomino1.n = sign1;
                                                                lastDomino1.n = "";
                                                                domino2.n = "";
                                                                pairDomino2.n = "";
                                                                lastDomino2.n = sign2;
                                                        } else if (adjacentSign1 == "") {
                                                                domino1.n = "";
                                                                lastDomino1.n = "";
                                                                lastDomino2.n = sign2;
                                                                domino2.n = opSign2;
                                                        } else { // adjacentSign1 == opSign1
                                                                domino1.n = sign1;
                                                                pairDomino1.n = opSign1;
                                                                lastDomino1.n = "";
                                                                domino2.n = "";
                                                                pairDomino2.n = "";
                                                                lastDomino2.n = sign2;
                                                        }

                                                } else { // pairDomino.n == sign1
                                                        let topDomino1 = stab1.get(x + 2, y - 1);
                                                        if (adjacentSign1 == sign1) {
                                                                domino1.n = opSign1;
                                                                domino2.n = "";
                                                        } else { // adjacentSign1 == ""
                                                                let sign2 = stab2.getSign(y, x - 1);
                                                                domino1.n = "";
                                                                pairDomino1.n = "";
                                                                domino2.n = sign2;
                                                                pairDomino2.n = oppositeSign(sign2);
                                                        }

                                                        if (topDomino1.n == "") {
                                                                stab1.putDomino(domino1);
                                                                stab2.putDomino(domino2);
                                                                let sideDomino2 = stab2.get(y - 1, x + 2);
                                                                myTableaux.putSignInCycleBottom(sideDomino2, sideDomino2.n, opSign1);
                                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                                                myTableaux.draw();
                                                                continue;
                                                        }
                                                }

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, sign1, y + 1);
                                        } else { // signData.sign == ""
                                                let pairSign2 = stab2.getSign(y - 1, x);
                                                let adjacentSign1 = stab1.getSign(x - 1, y);
                                                if (adjacentSign1 == "") {
                                                        domino1.n = "";
                                                        domino2.n = oppositeSign(pairSign2);
                                                } else { // adjacentSign1 == ""
                                                        let pairDomino2 = stab2.get(y - 1, x);
                                                        let pairDomino1 = stab1.get(x, y - 1);
                                                        pairDomino2.n = "";
                                                        domino2.n = "";
                                                        pairDomino1.n = adjacentSign1;
                                                        domino1.n = oppositeSign(adjacentSign1);
                                                }

                                                stab1.putDomino(domino1);
                                                stab2.putDomino(domino2);
                                                myTableaux.addNumberSign(number, pairSign2, stab2.getColumnLength(y - 1));
                                        }
                                }

                                myTableaux.draw();
                        }
                }

                return myTableaux;
        }

        static SOpqEvenRobSString(paramString) {
                let parameter = Parameter.parseParameterString(paramString);
                return Tableaux.SOpqEvenRobS(parameter);
        }

}

class Parameter {
        constructor(input) {
                if (Array.isArray(input)) {
                        this.parameter = input;
                } else if (typeof input == "string") {
                        this.parameter = Parameter.parseParameterString(input);
                } else {
                        this.parameter = [0];
                }
        }

        clone() {
                let param = [];
                this.parameter.forEach((item) => param.push(item));
                return new Parameter(param);
        }

        static generateParameter(n, pairsInput, topSingles) {
                let chooseOne = function(array) {
                        let choiceIndex = Math.floor(Math.random() * array.length);
                        return array.splice(choiceIndex, 1)[0];
                }

                let pairTotal = pairsInput;
                if (!pairTotal && pairTotal != 0) {
                        let maxPairs = Math.floor(n / 2);
                        pairTotal = Math.floor(Math.random() * (maxPairs + 1));
                }

                if (!topSingles) {
                        topSingles = Math.floor(Math.random() * (n + 1 - 2 * pairTotal));
                }

                let numbers = [];
                for (let i = 1; i <= n; i++) { numbers.push(i); }

                let parameter = [];
                parameter[0] = 0;
                for (let pairIndex = 1; pairIndex <= pairTotal; pairIndex++) {
                        let num1 = chooseOne(numbers);
                        let num2 = chooseOne(numbers);
                        if (num1 > num2) {
                                let temp = num1;
                                num1 = num2;
                                num2 = temp;
                        }

                        parameter[num2] = num1;
                        parameter[num1] = (Math.random() < .5) - 1;
                }

                for (let signIndex = 1; signIndex <= topSingles; signIndex++) {
                        let num = chooseOne(numbers);
                        parameter[num] = Math.random() < .5 ? "+": "-";
                }

                numbers.map((x) => {parameter[x] = Math.random() < .5 ? "s": "t";})

                return new Parameter(parameter);
        }

        parseParameter() {
                let parameter = this.parameter;
                let output = "";
                for (let number = 1; number < parameter.length; number++) {
                        if (parameter[number] == "+") {
                                output += number + "+ ";
                        } else if (parameter[number] == "-") {
                                output += number + "- ";
                        } else if (parameter[number] == "s") {
                                output += number + "s ";
                        } else if (parameter[number] == "t") {
                                output += number + "t ";
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                let signRef = parameter[first];
                                output += first + "_";
                                if (signRef == -1) {
                                        output += "-";
                                }

                                output += number + " ";
                        }
                }

                output = output.slice(0, -1);
                return output;
        }

        static parseParameterString(paramString) {
                let data = paramString.split(" ").filter(x => x);
                let parameter = [0];
                data.forEach((datum) => {
                                if (datum.endsWith("+")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "+";
                                } else if (datum.endsWith("-")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "-";
                                } else if (datum.endsWith("s")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "s";
                                } else if (datum.endsWith("t")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "t";
                                } else {
                                        data = datum.split("_");
                                        let number1 = parseInt(data[0]);
                                        let number2 = parseInt(data[1]);
                                        if (number2 < 0) {
                                                parameter[number1] = -1;
                                                number2 = -number2;
                                        } else {
                                                parameter[number1] = 0;
                                        }

                                        parameter[number2] = number1;
                                }
                });

                return parameter;
        }

        static getParameter(paramString) {
                return new Parameter(Parameter.parseParameterString(paramString));
        }
}

class TableauPair {
        constructor(left, right) {
                if (!left) {
                        this.left = new Tableau([]);
                        this.right = new Tableau([]);
                } else {
                        this.left = left;
                        this.right = right;
                }
        }

        clone() {
                let ret = new TableauPair();
                ret.left = this.left.clone();
                ret.right = this.right.clone();
                return ret;
        }

        draw() {
                document.body.appendChild(new TableauPairRendererDOM(this).renderDOM());
        }
}


class TableauRendererDOM {
        constructor(tbl) {
                this.tableau = tbl.tableau;
                this.gridSize = tbl.gridSize || 30;
                this.offset = tbl.offset || {x: 1, y:0}
        }

        renderDOM() {
                let wrapper = document.createElement('div');
                wrapper.className = "tableauRender";

                let grid = document.createElement('div');
                grid.className = "tableauGrid";
                wrapper.appendChild(grid);

                let width = 0;
                let height = 0;
                for (let d of this.tableau.dominoList) {
                        let dominoElem = document.createElement('div');
                        dominoElem.className = "domino";

                        if (d.box) {
                                dominoElem.className += " dominoBox";
                        } else if (d.horiz) {
                                dominoElem.className += " dominoHorizontal";
                        } else {
                                dominoElem.className += " dominoVertical";
                        }

                        if (d.highlight) {
                                dominoElem.className += " dominoHighlighted" + d.highlight.toString();
                        }

                        let x = d.x + this.offset.x;
                        let y = d.y + this.offset.y;

                        dominoElem.style.left = x * this.gridSize + "px";
                        dominoElem.style.top = y * this.gridSize + "px";

                        let curRight = x + (d.horiz || d.box ? 2 : 1);
                        if (width < curRight) { width = curRight; }
                        let curBottom = y + (!d.horiz || d.box ? 2 : 1);
                        if (height < curBottom) { height = curBottom; }

                        if (!d.box) {
                                let dominoText = document.createElement('div');
                                dominoText.className = "dominoText";
                                dominoText.innerHTML = d.n;
                                dominoElem.appendChild(dominoText);
                        }

                        wrapper.appendChild(dominoElem);
                }

                wrapper.style.width = width * this.gridSize;
                wrapper.style.height = height * this.gridSize;

                grid.style.width = Math.ceil(width / 2) * 2 * this.gridSize;
                grid.style.height = Math.ceil(height / 2) * 2 * this.gridSize;

                for(let i = 0; i < height; i += 2) {
                        for(let j = 0; j < width; j += 2) {
                                let gridCell = document.createElement('div');
                                gridCell.className = "tableauGridCell";
                                gridCell.style.left = j * this.gridSize + "px";
                                gridCell.style.top  = i * this.gridSize + "px";

                                grid.appendChild(gridCell);
                        }
                }

                return wrapper;
        }
}

class TableauPairRendererDOM {
        constructor(tableauPair) {
                this.tableauPair = tableauPair;
        }

        renderDOM() {
                let leftRenderer = new TableauRendererDOM({tableau: this.tableauPair.left});
                let rightRenderer = new TableauRendererDOM({tableau: this.tableauPair.right});
                let wrapperLeft = leftRenderer.renderDOM();
                let wrapperRight = rightRenderer.renderDOM();

                wrapperLeft.className += " tableauRenderLeft";
                wrapperRight.className += " tableauRenderRight";

                let wrapper = document.createElement('div');
                wrapper.className = "tableauPairRender";

                wrapper.appendChild(wrapperLeft);
                wrapper.appendChild(wrapperRight);

                return wrapper;
        }
}

class TableauPairListRendererDOM {
        constructor(tableauPairList) {
                this.tableauPairList = tableauPairList;
        }

        renderDOM() {
                let wrapper = document.createElement('div');
                wrapper.className = "tableauPairListRender";
                this.tableauPairList.forEach((tp) => {
                        let renderer = new TableauPairRendererDOM(tp);
                        let tpWrapper = renderer.renderDOM();
                        tpWrapper.className += " tableauRenderList";
                        wrapper.appendChild(tpWrapper);
                });
                return wrapper;
        }
}
