var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 12;
    gameLogic.COLS = 12;
    gameLogic.points_to_win = [10, 10];
    var head = [];
    head[0] = [];
    head[1] = [];
    head[0][0] = getInitialHP();
    head[0][1] = getInitialHP();
    head[1][0] = getInitialHP();
    head[1][1] = getInitialHP();
    function getInitialHP() {
        var temp = { index: Math.floor(Math.random() * 20) + 1, x: 0, y: 0, direct: 0 };
        return temp;
    }
    gameLogic.getInitialHP = getInitialHP;
    function getInitialBoard(i) {
        var board = [];
        // generate random craft head
        //head.index = Math.floor(Math.random() * 20) + 1;
        for (var i_1 = 0; i_1 < gameLogic.ROWS; i_1++) {
            board[i_1] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i_1][j] = 0;
            }
        }
        //-------1st aircraft---------------
        var first_aircraft_panel = Math.floor(Math.random() * 4) + 1;
        //choose a direction based on the head position
        if (head[i][0].index >= 17 && head[i][0].index <= 20) {
            var rand = Math.floor(Math.random() * 2) + 1;
            switch (head[i][0].index) {
                case 17:
                    if (rand == 1) {
                        head[i][0].direct = 1;
                    }
                    else {
                        head[i][0].direct = 2;
                    }
                    head[i][0].x = 2;
                    head[i][0].y = 2;
                    break;
                case 18:
                    if (rand == 1) {
                        head[i][0].direct = 1;
                    }
                    else {
                        head[i][0].direct = 3;
                    }
                    head[i][0].x = 3;
                    head[i][0].y = 2;
                    break;
                case 19:
                    if (rand == 1) {
                        head[i][0].direct = 2;
                    }
                    else {
                        head[i][0].direct = 4;
                    }
                    head[i][0].x = 2;
                    head[i][0].y = 3;
                    break;
                case 20:
                    if (rand == 1) {
                        head[i][0].direct = 3;
                    }
                    else {
                        head[i][0].direct = 4;
                    }
                    head[i][0].x = 3;
                    head[i][0].y = 3;
                    break;
            }
        }
        else if (head[i][0].index >= 1 && head[i][0].index <= 4) {
            head[i][0].direct = 1;
            head[i][0].x = (head[i][0].index === 1 || head[i][0].index == 3) ? 2 : 3;
            head[i][0].y = (head[i][0].index === 1 || head[i][0].index == 2) ? 0 : 1;
        }
        else if (head[i][0].index >= 5 && head[i][0].index <= 8) {
            head[i][0].direct = 2;
            head[i][0].x = (head[i][0].index === 5 || head[i][0].index == 7) ? 0 : 1;
            head[i][0].y = (head[i][0].index === 5 || head[i][0].index == 6) ? 2 : 3;
        }
        else if (head[i][0].index >= 9 && head[i][0].index <= 12) {
            head[i][0].direct = 3;
            head[i][0].x = (head[i][0].index === 9 || head[i][0].index == 11) ? 4 : 5;
            head[i][0].y = (head[i][0].index === 9 || head[i][0].index == 10) ? 2 : 3;
        }
        else if (head[i][0].index >= 13 && head[i][0].index <= 16) {
            head[i][0].direct = 4;
            head[i][0].x = (head[i][0].index === 13 || head[i][0].index == 15) ? 2 : 3;
            head[i][0].y = (head[i][0].index === 13 || head[i][0].index == 14) ? 4 : 5;
        }
        var x1 = 0;
        var y1 = 0;
        if (first_aircraft_panel === 1) {
            x1 = head[i][0].x;
            y1 = head[i][0].y;
        }
        else if (first_aircraft_panel === 2) {
            x1 = head[i][0].x + 6;
            y1 = head[i][0].y;
        }
        else if (first_aircraft_panel === 3) {
            x1 = head[i][0].x;
            y1 = head[i][0].y + 6;
        }
        else if (first_aircraft_panel === 4) {
            x1 = head[i][0].x + 6;
            y1 = head[i][0].y + 6;
        }
        //initial aircraft in board
        switch (head[i][0].direct) {
            case 1:
                board[x1][y1] = 10;
                //body
                board[x1][y1 + 1] = 5;
                board[x1][y1 + 2] = 5;
                //wing
                board[x1 - 2][y1 + 1] = 2;
                board[x1 - 1][y1 + 1] = 2;
                board[x1 + 1][y1 + 1] = 2;
                board[x1 + 2][y1 + 1] = 2;
                //tail
                board[x1 - 1][y1 + 3] = 3;
                board[x1][y1 + 3] = 3;
                board[x1 + 1][y1 + 3] = 3;
                break;
            case 2:
                board[x1][y1] = 10;
                //body
                board[x1 + 1][y1] = 5;
                board[x1 + 2][y1] = 5;
                //wing
                board[x1 + 1][y1 - 2] = 2;
                board[x1 + 1][y1 - 1] = 2;
                board[x1 + 1][y1 + 1] = 2;
                board[x1 + 1][y1 + 2] = 2;
                //tail
                board[x1 + 3][y1 - 1] = 3;
                board[x1 + 3][y1 + 1] = 3;
                board[x1 + 3][y1] = 3;
                break;
            case 3:
                board[x1][y1] = 10;
                //body
                board[x1 - 1][y1] = 5;
                board[x1 - 2][y1] = 5;
                //wing
                board[x1 - 1][y1 - 2] = 2;
                board[x1 - 1][y1 - 1] = 2;
                board[x1 - 1][y1 + 1] = 2;
                board[x1 - 1][y1 + 2] = 2;
                //tail
                board[x1 - 3][y1 - 1] = 3;
                board[x1 - 3][y1 + 1] = 3;
                board[x1 - 3][y1] = 3;
                break;
            case 4:
                board[x1][y1] = 10;
                //body
                board[x1][y1 - 1] = 5;
                board[x1][y1 - 2] = 5;
                //wing
                board[x1 - 2][y1 - 1] = 2;
                board[x1 - 1][y1 - 1] = 2;
                board[x1 + 1][y1 - 1] = 2;
                board[x1 + 2][y1 - 1] = 2;
                //tail
                board[x1 - 1][y1 - 3] = 3;
                board[x1][y1 - 3] = 3;
                board[x1 + 1][y1 - 3] = 3;
                break;
        }
        //-------1st aircraft---------------
        //-------2nd aircraft----------------
        var second_aircraft_panel = (first_aircraft_panel + Math.floor(Math.random() * 3) + 1) % 4;
        if (second_aircraft_panel === 0)
            second_aircraft_panel = 4;
        if (head[i][1].index >= 17 && head[i][1].index <= 20) {
            var rand = Math.floor(Math.random() * 2) + 1;
            switch (head[i][1].index) {
                case 17:
                    if (rand == 1) {
                        head[i][1].direct = 1;
                    }
                    else {
                        head[i][1].direct = 2;
                    }
                    head[i][1].x = 2;
                    head[i][1].y = 2;
                    break;
                case 18:
                    if (rand == 1) {
                        head[i][1].direct = 1;
                    }
                    else {
                        head[i][1].direct = 3;
                    }
                    head[i][1].x = 3;
                    head[i][1].y = 2;
                    break;
                case 19:
                    if (rand == 1) {
                        head[i][1].direct = 2;
                    }
                    else {
                        head[i][1].direct = 4;
                    }
                    head[i][1].x = 2;
                    head[i][1].y = 3;
                    break;
                case 20:
                    if (rand == 1) {
                        head[i][1].direct = 3;
                    }
                    else {
                        head[i][1].direct = 4;
                    }
                    head[i][1].x = 3;
                    head[i][1].y = 3;
                    break;
            }
        }
        else if (head[i][1].index >= 1 && head[i][1].index <= 4) {
            head[i][1].direct = 1;
            head[i][1].x = (head[i][1].index === 1 || head[i][1].index == 3) ? 2 : 3;
            head[i][1].y = (head[i][1].index === 1 || head[i][1].index == 2) ? 0 : 1;
        }
        else if (head[i][1].index >= 5 && head[i][1].index <= 8) {
            head[i][1].direct = 2;
            head[i][1].x = (head[i][1].index === 5 || head[i][1].index == 7) ? 0 : 1;
            head[i][1].y = (head[i][1].index === 5 || head[i][1].index == 6) ? 2 : 3;
        }
        else if (head[i][1].index >= 9 && head[i][1].index <= 12) {
            head[i][1].direct = 3;
            head[i][1].x = (head[i][1].index === 9 || head[i][1].index == 11) ? 4 : 5;
            head[i][1].y = (head[i][1].index === 9 || head[i][1].index == 10) ? 2 : 3;
        }
        else if (head[i][1].index >= 13 && head[i][1].index <= 16) {
            head[i][1].direct = 4;
            head[i][1].x = (head[i][1].index === 13 || head[i][1].index == 15) ? 2 : 3;
            head[i][1].y = (head[i][1].index === 13 || head[i][1].index == 14) ? 4 : 5;
        }
        var x2 = 0;
        var y2 = 0;
        if (second_aircraft_panel === 1) {
            x2 = head[i][1].x;
            y2 = head[i][1].y;
        }
        else if (second_aircraft_panel === 2) {
            x2 = head[i][1].x + 6;
            y2 = head[i][1].y;
        }
        else if (second_aircraft_panel === 3) {
            x2 = head[i][1].x;
            y2 = head[i][1].y + 6;
        }
        else if (second_aircraft_panel === 4) {
            x2 = head[i][1].x + 6;
            y2 = head[i][1].y + 6;
        }
        //initial aircraft in board
        switch (head[i][1].direct) {
            case 1:
                board[x2][y2] = 10;
                //body
                board[x2][y2 + 1] = 5;
                board[x2][y2 + 2] = 5;
                //wing
                board[x2 - 2][y2 + 1] = 2;
                board[x2 - 1][y2 + 1] = 2;
                board[x2 + 1][y2 + 1] = 2;
                board[x2 + 2][y2 + 1] = 2;
                //tail
                board[x2 - 1][y2 + 3] = 3;
                board[x2][y2 + 3] = 3;
                board[x2 + 1][y2 + 3] = 3;
                break;
            case 2:
                board[x2][y2] = 10;
                //body
                board[x2 + 1][y2] = 5;
                board[x2 + 2][y2] = 5;
                //wing
                board[x2 + 1][y2 - 2] = 2;
                board[x2 + 1][y2 - 1] = 2;
                board[x2 + 1][y2 + 1] = 2;
                board[x2 + 1][y2 + 2] = 2;
                //tail
                board[x2 + 3][y2 - 1] = 3;
                board[x2 + 3][y2 + 1] = 3;
                board[x2 + 3][y2] = 3;
                break;
            case 3:
                board[x2][y2] = 10;
                //body
                board[x2 - 1][y2] = 5;
                board[x2 - 2][y2] = 5;
                //wing
                board[x2 - 1][y2 - 2] = 2;
                board[x2 - 1][y2 - 1] = 2;
                board[x2 - 1][y2 + 1] = 2;
                board[x2 - 1][y2 + 2] = 2;
                //tail
                board[x2 - 3][y2 - 1] = 3;
                board[x2 - 3][y2 + 1] = 3;
                board[x2 - 3][y2] = 3;
                break;
            case 4:
                board[x2][y2] = 10;
                //body
                board[x2][y2 - 1] = 5;
                board[x2][y2 - 2] = 5;
                //wing
                board[x2 - 2][y2 - 1] = 2;
                board[x2 - 1][y2 - 1] = 2;
                board[x2 + 1][y2 - 1] = 2;
                board[x2 + 2][y2 - 1] = 2;
                //tail
                board[x2 - 1][y2 - 3] = 3;
                board[x2][y2 - 3] = 3;
                board[x2 + 1][y2 - 3] = 3;
                break;
        }
        //-------2nd aircraft----------------
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getPTW(turnIndex) {
        return gameLogic.points_to_win[turnIndex];
    }
    gameLogic.getPTW = getPTW;
    function getInitialState() {
        var temp_board_0 = getInitialBoard(0);
        var temp_board_1 = getInitialBoard(1);
        return { board: [temp_board_0, temp_board_1], delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    function winOrNot(turnIndexBeforeMove) {
        if (gameLogic.points_to_win[turnIndexBeforeMove] <= 0) {
            alert("Game Over!");
            return true;
        }
        else
            return false;
    }
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        //same index = move board; otherwise show board
        var board = stateBeforeMove.board[turnIndexBeforeMove];
        if (board[row][col] < 0) {
            throw new Error("One can only make a move in an empty position!");
        }
        if (winOrNot(turnIndexBeforeMove)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = angular.copy(board);
        if (boardAfterMove[row][col] > 0) {
            gameLogic.points_to_win[turnIndexBeforeMove] -= boardAfterMove[row][col];
            boardAfterMove[row][col] = -boardAfterMove[row][col];
        }
        else {
            boardAfterMove[row][col] = -1;
        }
        var finalboard = [];
        finalboard[turnIndexBeforeMove] = boardAfterMove;
        finalboard[1 - turnIndexBeforeMove] = stateBeforeMove.board[1 - turnIndexBeforeMove];
        var winner = winOrNot(turnIndexBeforeMove);
        var turnIndex = turnIndexBeforeMove;
        var temp_score = [0, 0];
        if (winner) {
            turnIndex = -1;
            temp_score[turnIndexBeforeMove] = 10 - gameLogic.points_to_win[turnIndexBeforeMove];
            temp_score[1 - turnIndexBeforeMove] = 10 - gameLogic.points_to_win[1 - turnIndexBeforeMove];
        }
        else {
            turnIndex = 1 - turnIndex;
            temp_score = null;
        }
        var delta = { row: row, col: col };
        var state = { delta: delta, board: finalboard };
        //endMatchScores: number[];
        return { turnIndex: turnIndex, state: state, endMatchScores: temp_score };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return 0;
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, 0, 0, 0);
        log.log("move=", move);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map