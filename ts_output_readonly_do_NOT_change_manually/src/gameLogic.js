var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 6;
    gameLogic.COLS = 6;
    function getInitialHeadPosition() {
        var temp = { index: Math.floor(Math.random() * 20) + 1, x: 0, y: 0, direct: 0 };
        return temp;
    }
    gameLogic.getInitialHeadPosition = getInitialHeadPosition;
    //  HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard(i) {
        var board = [];
        var head = [];
        head[i] = getInitialHeadPosition();
        //head[1] = getInitialHeadPosition();
        // generate random craft head
        //head.index = Math.floor(Math.random() * 20) + 1;
        //choose a direction based on the head position
        if (head[i].index >= 17 && head[i].index <= 20) {
            var rand = Math.floor(Math.random() * 2) + 1;
            switch (head[i].index) {
                case 17:
                    if (rand == 1) {
                        head[i].direct = 1;
                    }
                    else {
                        head[i].direct = 2;
                    }
                    head[i].x = 2;
                    head[i].y = 2;
                    break;
                case 18:
                    if (rand == 1) {
                        head[i].direct = 1;
                    }
                    else {
                        head[i].direct = 3;
                    }
                    head[i].x = 3;
                    head[i].y = 2;
                    break;
                case 19:
                    if (rand == 1) {
                        head[i].direct = 2;
                    }
                    else {
                        head[i].direct = 4;
                    }
                    head[i].x = 2;
                    head[i].y = 3;
                    break;
                case 20:
                    if (rand == 1) {
                        head[i].direct = 3;
                    }
                    else {
                        head[i].direct = 4;
                    }
                    head[i].x = 3;
                    head[i].y = 3;
                    break;
            }
        }
        else if (head[i].index >= 1 && head[i].index <= 4) {
            head[i].direct = 1;
            head[i].x = (head[i].index === 1 || head[i].index == 3) ? 2 : 3;
            head[i].y = (head[i].index === 1 || head[i].index == 2) ? 0 : 1;
        }
        else if (head[i].index >= 5 && head[i].index <= 8) {
            head[i].direct = 2;
            head[i].x = (head[i].index === 5 || head[i].index == 7) ? 0 : 1;
            head[i].y = (head[i].index === 5 || head[i].index == 6) ? 2 : 3;
        }
        else if (head[i].index >= 9 && head[i].index <= 12) {
            head[i].direct = 3;
            head[i].x = (head[i].index === 9 || head[i].index == 11) ? 4 : 5;
            head[i].y = (head[i].index === 9 || head[i].index == 10) ? 2 : 3;
        }
        else if (head[i].index >= 13 && head[i].index <= 16) {
            head[i].direct = 4;
            head[i].x = (head[i].index === 13 || head[i].index == 15) ? 2 : 3;
            head[i].y = (head[i].index === 13 || head[i].index == 14) ? 4 : 5;
        }
        for (var i_1 = 0; i_1 < gameLogic.ROWS; i_1++) {
            board[i_1] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i_1][j] = 0;
            }
        }
        var x = head[i].x;
        var y = head[i].y;
        //initial aircraft in board
        switch (head[i].direct) {
            case 1:
                board[x][y] = 10;
                //body
                board[x][y + 1] = 5;
                board[x][y + 2] = 5;
                //wing
                board[x - 2][y + 1] = 2;
                board[x - 1][y + 1] = 2;
                board[x + 1][y + 1] = 2;
                board[x + 2][y + 1] = 2;
                //tail
                board[x - 1][y + 3] = 3;
                board[x][y + 3] = 3;
                board[x + 1][y + 3] = 3;
                break;
            case 2:
                board[x][y] = 10;
                //body
                board[x + 1][y] = 5;
                board[x + 2][y] = 5;
                //wing
                board[x + 1][y - 2] = 2;
                board[x + 1][y - 1] = 2;
                board[x + 1][y + 1] = 2;
                board[x + 1][y + 2] = 2;
                //tail
                board[x + 3][y - 1] = 3;
                board[x + 3][y + 1] = 3;
                board[x + 3][y] = 3;
                break;
            case 3:
                board[x][y] = 10;
                //body
                board[x - 1][y] = 5;
                board[x - 2][y] = 5;
                //wing
                board[x - 1][y - 2] = 2;
                board[x - 1][y - 1] = 2;
                board[x - 1][y + 1] = 2;
                board[x - 1][y + 2] = 2;
                //tail
                board[x - 3][y - 1] = 3;
                board[x - 3][y + 1] = 3;
                board[x - 3][y] = 3;
                break;
            case 4:
                board[x][y] = 10;
                //body
                board[x][y - 1] = 5;
                board[x][y - 2] = 5;
                //wing
                board[x - 2][y - 1] = 2;
                board[x - 1][y - 1] = 2;
                board[x + 1][y - 1] = 2;
                board[x + 2][y - 1] = 2;
                //tail
                board[x - 1][y - 3] = 3;
                board[x][y - 3] = 3;
                board[x + 1][y - 3] = 3;
                break;
        }
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getPTW(state, turnIndex) {
        return state.points_To_Win[turnIndex];
    }
    gameLogic.getPTW = getPTW;
    function getInitialState() {
        var _direction = [];
        _direction[0] = 0;
        _direction[1] = 0;
        var _headLoc = [];
        _headLoc[0] = [0, 0];
        _headLoc[1] = [0, 0];
        var _body1 = [];
        _body1[0] = [0, 0];
        _body1[1] = [0, 0];
        var _body2 = [];
        _body2[0] = [0, 0];
        _body2[1] = [0, 0];
        var _leftwing1 = [];
        _leftwing1[0] = [0, 0];
        _leftwing1[1] = [0, 0];
        var _leftwing2 = [];
        _leftwing2[0] = [0, 0];
        _leftwing2[1] = [0, 0];
        var _rightwing1 = [];
        _rightwing1[0] = [0, 0];
        _rightwing1[1] = [0, 0];
        var _rightwing2 = [];
        _rightwing2[0] = [0, 0];
        _rightwing2[1] = [0, 0];
        var _lefttail = [];
        _lefttail[0] = [0, 0];
        _lefttail[1] = [0, 0];
        var _midtail = [];
        _midtail[0] = [0, 0];
        _midtail[1] = [0, 0];
        var _righttail = [];
        _righttail[0] = [0, 0];
        _righttail[1] = [0, 0];
        var temp_board_0 = getInitialBoard(0);
        var temp_board_1 = getInitialBoard(1);
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                //----------For the first aircraft.
                // Not annoying corner case.
                if (temp_board_0[i][j] === 10 && i !== 0 && j !== 0 && i !== 5 && j !== 5) {
                    // Head toward right.
                    if (temp_board_0[i][j - 1] === 5) {
                        _headLoc[0] = [i, j];
                        _body1[0] = [i, j - 1];
                        _body2[0] = [i, j - 2];
                        _leftwing1[0] = [i - 1, j - 1];
                        _leftwing2[0] = [i - 2, j - 1];
                        _rightwing1[0] = [i + 1, j - 1];
                        _rightwing2[0] = [i + 2, j - 1];
                        _midtail[0] = [i, j - 3];
                        _lefttail[0] = [i - 1, j - 3];
                        _righttail[0] = [i + 1, j - 3];
                        _direction[0] = 4;
                    }
                    else if (temp_board_0[i][j + 1] === 5) {
                        _headLoc[0] = [i, j];
                        _body1[0] = [i, j + 1];
                        _body2[0] = [i, j + 2];
                        _leftwing1[0] = [i + 1, j + 1];
                        _leftwing2[0] = [i + 2, j + 1];
                        _rightwing1[0] = [i - 1, j + 1];
                        _rightwing2[0] = [i - 2, j + 1];
                        _midtail[0] = [i, j + 3];
                        _lefttail[0] = [i + 1, j + 3];
                        _righttail[0] = [i - 1, j + 3];
                        _direction[0] = 3;
                    }
                    else if (temp_board_0[i - 1][j] === 5) {
                        _headLoc[0] = [i, j];
                        _body1[0] = [i - 1, j];
                        _body2[0] = [i - 2, j];
                        _leftwing1[0] = [i - 1, j + 1];
                        _leftwing2[0] = [i - 1, j + 2];
                        _rightwing1[0] = [i - 1, j - 1];
                        _rightwing2[0] = [i - 1, j - 2];
                        _midtail[0] = [i - 3, j];
                        _lefttail[0] = [i - 3, j + 1];
                        _righttail[0] = [i - 3, j - 1];
                        _direction[0] = 2;
                    }
                    else if (temp_board_0[i + 1][j] === 5) {
                        _headLoc[0] = [i, j];
                        _body1[0] = [i + 1, j];
                        _body2[0] = [i + 2, j];
                        _leftwing1[0] = [i + 1, j - 1];
                        _leftwing2[0] = [i + 1, j - 2];
                        _rightwing1[0] = [i + 1, j + 1];
                        _rightwing2[0] = [i + 1, j + 2];
                        _midtail[0] = [i + 3, j];
                        _lefttail[0] = [i + 3, j - 1];
                        _righttail[0] = [i + 3, j + 1];
                        _direction[0] = 1;
                    }
                }
                else if (temp_board_0[i][j] === 10 && i == 0) {
                    _headLoc[0] = [i, j];
                    _body1[0] = [i + 1, j];
                    _body2[0] = [i + 2, j];
                    _leftwing1[0] = [i + 1, j - 1];
                    _leftwing2[0] = [i + 1, j - 2];
                    _rightwing1[0] = [i + 1, j + 1];
                    _rightwing2[0] = [i + 1, j + 2];
                    _midtail[0] = [i + 3, j];
                    _lefttail[0] = [i + 3, j - 1];
                    _righttail[0] = [i + 3, j + 1];
                    _direction[0] = 1;
                }
                else if (temp_board_0[i][j] === 10 && i == 5) {
                    _headLoc[0] = [i, j];
                    _body1[0] = [i - 1, j];
                    _body2[0] = [i - 2, j];
                    _leftwing1[0] = [i - 1, j + 1];
                    _leftwing2[0] = [i - 1, j + 2];
                    _rightwing1[0] = [i - 1, j - 1];
                    _rightwing2[0] = [i - 1, j - 2];
                    _midtail[0] = [i - 3, j];
                    _lefttail[0] = [i - 3, j + 1];
                    _righttail[0] = [i - 3, j - 1];
                    _direction[0] = 2;
                }
                else if (temp_board_0[i][j] === 10 && j == 0) {
                    _headLoc[0] = [i, j];
                    _body1[0] = [i, j + 1];
                    _body2[0] = [i, j + 2];
                    _leftwing1[0] = [i + 1, j + 1];
                    _leftwing2[0] = [i + 2, j + 1];
                    _rightwing1[0] = [i - 1, j + 1];
                    _rightwing2[0] = [i - 2, j + 1];
                    _midtail[0] = [i, j + 3];
                    _lefttail[0] = [i + 1, j + 3];
                    _righttail[0] = [i - 1, j + 3];
                    _direction[0] = 3;
                }
                else if (temp_board_0[i][j] === 10 && j == 5) {
                    _headLoc[0] = [i, j];
                    _body1[0] = [i, j - 1];
                    _body2[0] = [i, j - 2];
                    _leftwing1[0] = [i - 1, j - 1];
                    _leftwing2[0] = [i - 2, j - 1];
                    _rightwing1[0] = [i + 1, j - 1];
                    _rightwing2[0] = [i + 2, j - 1];
                    _midtail[0] = [i, j - 3];
                    _lefttail[0] = [i - 1, j - 3];
                    _righttail[0] = [i + 1, j - 3];
                    _direction[0] = 4;
                }
                //----------For the first aircraft.
                //---------For the second aircraft.
                // Not annoying corner case.
                if (temp_board_1[i][j] === 10 && i !== 0 && j !== 0 && i !== 5 && j !== 5) {
                    // Head toward right.
                    if (temp_board_1[i][j - 1] === 5) {
                        _headLoc[1] = [i, j];
                        _body1[1] = [i, j - 1];
                        _body2[1] = [i, j - 2];
                        _leftwing1[1] = [i - 1, j - 1];
                        _leftwing2[1] = [i - 2, j - 1];
                        _rightwing1[1] = [i + 1, j - 1];
                        _rightwing2[1] = [i + 2, j - 1];
                        _midtail[1] = [i, j - 3];
                        _lefttail[1] = [i - 1, j - 3];
                        _righttail[1] = [i + 1, j - 3];
                        _direction[1] = 4;
                    }
                    else if (temp_board_1[i][j + 1] === 5) {
                        _headLoc[1] = [i, j];
                        _body1[1] = [i, j + 1];
                        _body2[1] = [i, j + 2];
                        _leftwing1[1] = [i + 1, j + 1];
                        _leftwing2[1] = [i + 2, j + 1];
                        _rightwing1[1] = [i - 1, j + 1];
                        _rightwing2[1] = [i - 2, j + 1];
                        _midtail[1] = [i, j + 3];
                        _lefttail[1] = [i + 1, j + 3];
                        _righttail[1] = [i - 1, j + 3];
                        _direction[1] = 3;
                    }
                    else if (temp_board_1[i - 1][j] === 5) {
                        _headLoc[1] = [i, j];
                        _body1[1] = [i - 1, j];
                        _body2[1] = [i - 2, j];
                        _leftwing1[1] = [i - 1, j + 1];
                        _leftwing2[1] = [i - 1, j + 2];
                        _rightwing1[1] = [i - 1, j - 1];
                        _rightwing2[1] = [i - 1, j - 2];
                        _midtail[1] = [i - 3, j];
                        _lefttail[1] = [i - 3, j + 1];
                        _righttail[1] = [i - 3, j - 1];
                        _direction[1] = 2;
                    }
                    else if (temp_board_1[i + 1][j] === 5) {
                        _headLoc[1] = [i, j];
                        _body1[1] = [i + 1, j];
                        _body2[1] = [i + 2, j];
                        _leftwing1[1] = [i + 1, j - 1];
                        _leftwing2[1] = [i + 1, j - 2];
                        _rightwing1[1] = [i + 1, j + 1];
                        _rightwing2[1] = [i + 1, j + 2];
                        _midtail[1] = [i + 3, j];
                        _lefttail[1] = [i + 3, j - 1];
                        _righttail[1] = [i + 3, j + 1];
                        _direction[1] = 1;
                    }
                }
                else if (temp_board_1[i][j] === 10 && i == 0) {
                    _headLoc[1] = [i, j];
                    _body1[1] = [i + 1, j];
                    _body2[1] = [i + 2, j];
                    _leftwing1[1] = [i + 1, j - 1];
                    _leftwing2[1] = [i + 1, j - 2];
                    _rightwing1[1] = [i + 1, j + 1];
                    _rightwing2[1] = [i + 1, j + 2];
                    _midtail[1] = [i + 3, j];
                    _lefttail[1] = [i + 3, j - 1];
                    _righttail[1] = [i + 3, j + 1];
                    _direction[1] = 1;
                }
                else if (temp_board_1[i][j] === 10 && i == 5) {
                    _headLoc[1] = [i, j];
                    _body1[1] = [i - 1, j];
                    _body2[1] = [i - 2, j];
                    _leftwing1[1] = [i - 1, j + 1];
                    _leftwing2[1] = [i - 1, j + 2];
                    _rightwing1[1] = [i - 1, j - 1];
                    _rightwing2[1] = [i - 1, j - 2];
                    _midtail[1] = [i - 3, j];
                    _lefttail[1] = [i - 3, j + 1];
                    _righttail[1] = [i - 3, j - 1];
                    _direction[1] = 2;
                }
                else if (temp_board_1[i][j] === 10 && j == 0) {
                    _headLoc[1] = [i, j];
                    _body1[1] = [i, j + 1];
                    _body2[1] = [i, j + 2];
                    _leftwing1[1] = [i + 1, j + 1];
                    _leftwing2[1] = [i + 2, j + 1];
                    _rightwing1[1] = [i - 1, j + 1];
                    _rightwing2[1] = [i - 2, j + 1];
                    _midtail[1] = [i, j + 3];
                    _lefttail[1] = [i + 1, j + 3];
                    _righttail[1] = [i - 1, j + 3];
                    _direction[1] = 3;
                }
                else if (temp_board_1[i][j] === 10 && j == 5) {
                    _headLoc[1] = [i, j];
                    _body1[1] = [i, j - 1];
                    _body2[1] = [i, j - 2];
                    _leftwing1[1] = [i - 1, j - 1];
                    _leftwing2[1] = [i - 2, j - 1];
                    _rightwing1[1] = [i + 1, j - 1];
                    _rightwing2[1] = [i + 2, j - 1];
                    _midtail[1] = [i, j - 3];
                    _lefttail[1] = [i - 1, j - 3];
                    _righttail[1] = [i + 1, j - 3];
                    _direction[1] = 4;
                }
            }
        }
        return { board: [temp_board_0, temp_board_1], delta: null, points_To_Win: [10, 10], headLoc: _headLoc, body1: _body1, body2: _body2,
            leftwing1: _leftwing1, leftwing2: _leftwing2, rightwing1: _rightwing1, rightwing2: _rightwing2, lefttail: _lefttail, midtail: _midtail, righttail: _righttail,
            direction: _direction };
    }
    gameLogic.getInitialState = getInitialState;
    function winOrNot(turnIndexBeforeMove, state) {
        if (state.points_To_Win[turnIndexBeforeMove] <= 0 && state.points_To_Win[1 - turnIndexBeforeMove] > 0) {
            return true;
        }
        else
            return false;
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
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
        var headLoc = angular.copy(stateBeforeMove.headLoc);
        var body1 = angular.copy(stateBeforeMove.body1);
        var body2 = angular.copy(stateBeforeMove.body2);
        var leftwing1 = angular.copy(stateBeforeMove.leftwing1);
        var leftwing2 = angular.copy(stateBeforeMove.leftwing2);
        var rightwing1 = angular.copy(stateBeforeMove.rightwing1);
        var rightwing2 = angular.copy(stateBeforeMove.rightwing2);
        var lefttail = angular.copy(stateBeforeMove.lefttail);
        var righttail = angular.copy(stateBeforeMove.righttail);
        var midtail = angular.copy(stateBeforeMove.midtail);
        var direction = angular.copy(stateBeforeMove.direction);
        if (boardAfterMove[row][col] > 0) {
            points_To_Win[turnIndexBeforeMove] -= boardAfterMove[row][col];
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
        var new_state = { delta: new_delta, board: finalboard, points_To_Win: new_points_To_Win,
            headLoc: headLoc, body1: body1, body2: body2, leftwing1: leftwing1, leftwing2: leftwing2, rightwing1: rightwing1, rightwing2: rightwing2, lefttail: lefttail, righttail: righttail, midtail: midtail, direction: direction };
        //-----
        var winner = winOrNot(turnIndexBeforeMove, new_state);
        var turnIndex = turnIndexBeforeMove;
        var endMatchScores = [0, 0];
        if (winner) {
            turnIndex = -1;
            endMatchScores[turnIndexBeforeMove] = 10 - points_To_Win[turnIndexBeforeMove];
            endMatchScores[1 - turnIndexBeforeMove] = 10 - points_To_Win[1 - turnIndexBeforeMove];
        }
        else {
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        var delta = { row: row, col: col };
        var state = { delta: delta, board: finalboard, points_To_Win: points_To_Win,
            headLoc: headLoc, body1: body1, body2: body2, leftwing1: leftwing1, leftwing2: leftwing2, rightwing1: rightwing1, rightwing2: rightwing2, lefttail: lefttail, righttail: righttail, midtail: midtail, direction: direction };
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