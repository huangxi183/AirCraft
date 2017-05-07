var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
<<<<<<< HEAD
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
=======
    gameLogic.ROWS = 6;
    gameLogic.COLS = 6;
    function getInitialHeadPosition() {
        var temp = { index: Math.floor(Math.random() * 20) + 1, x: 0, y: 0, direct: 0 };
        return temp;
    }
    gameLogic.getInitialHeadPosition = getInitialHeadPosition;
    //  HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
>>>>>>> master
    function getInitialBoard(i) {
        var board = [];
        var head = [];
        head[i] = getInitialHeadPosition();
        //head[1] = getInitialHeadPosition();
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
<<<<<<< HEAD
    function getPTW(turnIndex) {
        return gameLogic.points_to_win[turnIndex];
=======
    function getPTW(state, turnIndex) {
        return state.points_To_Win[turnIndex];
>>>>>>> master
    }
    gameLogic.getPTW = getPTW;
    function getInitialState() {
        var temp_board_0 = getInitialBoard(0);
        var temp_board_1 = getInitialBoard(1);
        return { board: [temp_board_0, temp_board_1], delta: null, points_To_Win: [10, 10] };
    }
    gameLogic.getInitialState = getInitialState;
<<<<<<< HEAD
    function winOrNot(turnIndexBeforeMove) {
        if (gameLogic.points_to_win[turnIndexBeforeMove] <= 0) {
            alert("Game Over!");
=======
    function winOrNot(turnIndexBeforeMove, state) {
        if (state.points_To_Win[turnIndexBeforeMove] <= 0 && state.points_To_Win[1 - turnIndexBeforeMove] > 0) {
>>>>>>> master
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
        if (winOrNot(turnIndexBeforeMove, stateBeforeMove)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = angular.copy(board);
        var points_To_Win = angular.copy(stateBeforeMove.points_To_Win);
        if (boardAfterMove[row][col] > 0) {
<<<<<<< HEAD
            gameLogic.points_to_win[turnIndexBeforeMove] -= boardAfterMove[row][col];
=======
            points_To_Win[turnIndexBeforeMove] -= boardAfterMove[row][col];
>>>>>>> master
            boardAfterMove[row][col] = -boardAfterMove[row][col];
        }
        else {
            boardAfterMove[row][col] = -1;
        }
        var finalboard = [];
        finalboard[turnIndexBeforeMove] = boardAfterMove;
        finalboard[1 - turnIndexBeforeMove] = stateBeforeMove.board[1 - turnIndexBeforeMove];
        //-----
        var new_points_To_Win = points_To_Win;
        var new_delta = { row: row, col: col };
        var new_state = { delta: new_delta, board: finalboard, points_To_Win: new_points_To_Win };
        //-----
        var winner = winOrNot(turnIndexBeforeMove, new_state);
        var turnIndex = turnIndexBeforeMove;
        var endMatchScores = [0, 0];
        if (winner) {
            turnIndex = -1;
<<<<<<< HEAD
            temp_score[turnIndexBeforeMove] = 10 - gameLogic.points_to_win[turnIndexBeforeMove];
            temp_score[1 - turnIndexBeforeMove] = 10 - gameLogic.points_to_win[1 - turnIndexBeforeMove];
=======
            endMatchScores[turnIndexBeforeMove] = 10 - points_To_Win[turnIndexBeforeMove];
            endMatchScores[1 - turnIndexBeforeMove] = 10 - points_To_Win[1 - turnIndexBeforeMove];
            /*
            points_to_win[0] = 10;
            points_to_win[1] = 10;
            head[0] = getInitialHP();
            head[1] = getInitialHP();
            */
>>>>>>> master
        }
        else {
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        var delta = { row: row, col: col };
        var state = { delta: delta, board: finalboard, points_To_Win: points_To_Win };
        //endMatchScores: number[];
        return { turnIndex: turnIndex, state: state, endMatchScores: endMatchScores };
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