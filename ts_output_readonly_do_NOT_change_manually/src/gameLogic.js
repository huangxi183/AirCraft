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
        var temp_board_0 = getInitialBoard(0);
        var temp_board_1 = getInitialBoard(1);
        return { board: [temp_board_0, temp_board_1], delta: null, points_To_Win: [10, 10] };
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
        var new_state = { delta: new_delta, board: finalboard, points_To_Win: new_points_To_Win };
        //-----
        var winner = winOrNot(turnIndexBeforeMove, new_state);
        var turnIndex = turnIndexBeforeMove;
        var endMatchScores = [0, 0];
        if (winner) {
            turnIndex = -1;
            endMatchScores[turnIndexBeforeMove] = 10 - points_To_Win[turnIndexBeforeMove];
            endMatchScores[1 - turnIndexBeforeMove] = 10 - points_To_Win[1 - turnIndexBeforeMove];
            /*
            points_to_win[0] = 10;
            points_to_win[1] = 10;
            head[0] = getInitialHP();
            head[1] = getInitialHP();
            */
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