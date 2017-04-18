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
    var points_to_win = 10;
    var head = { index: Math.floor(Math.random() * 20) + 1, x: 0, y: 0, direct: 0 };
    /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        // generate random craft head
        //head.index = Math.floor(Math.random() * 20) + 1;
        //choose a direction based on the head position
        if (head.index >= 17 && head.index <= 20) {
            var rand = Math.floor(Math.random() * 2) + 1;
            switch (head.index) {
                case 17:
                    if (rand == 1) {
                        head.direct = 1;
                    }
                    else {
                        head.direct = 2;
                    }
                    head.x = 2;
                    head.y = 2;
                    break;
                case 18:
                    if (rand == 1) {
                        head.direct = 1;
                    }
                    else {
                        head.direct = 3;
                    }
                    head.x = 3;
                    head.y = 2;
                    break;
                case 19:
                    if (rand == 1) {
                        head.direct = 2;
                    }
                    else {
                        head.direct = 4;
                    }
                    head.x = 2;
                    head.y = 3;
                    break;
                case 20:
                    if (rand == 1) {
                        head.direct = 3;
                    }
                    else {
                        head.direct = 4;
                    }
                    head.x = 3;
                    head.y = 3;
                    break;
            }
        }
        else if (head.index >= 1 && head.index <= 4) {
            head.direct = 1;
            head.x = (head.index === 1 || head.index == 3) ? 2 : 3;
            head.y = (head.index === 1 || head.index == 2) ? 0 : 1;
        }
        else if (head.index >= 5 && head.index <= 8) {
            head.direct = 2;
            head.x = (head.index === 5 || head.index == 7) ? 0 : 1;
            head.y = (head.index === 5 || head.index == 6) ? 2 : 3;
        }
        else if (head.index >= 9 && head.index <= 12) {
            head.direct = 3;
            head.x = (head.index === 9 || head.index == 11) ? 4 : 5;
            head.y = (head.index === 9 || head.index == 10) ? 2 : 3;
        }
        else if (head.index >= 13 && head.index <= 16) {
            head.direct = 4;
            head.x = (head.index === 13 || head.index == 15) ? 2 : 3;
            head.y = (head.index === 13 || head.index == 14) ? 4 : 5;
        }
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = 0;
            }
        }
        var x = head.x;
        var y = head.y;
        //initial aircraft in board
        switch (head.direct) {
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
    function getInitialState() {
        return { board: getInitialBoard(), delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Return the winner (either 'X' or 'O') or '' if there is no winner.
     * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
     * E.g., getWinner returns 'X' for the following board:
     *     [['X', 'O', ''],
     *      ['X', 'O', ''],
     *      ['X', '', '']]
     */
    function winOrNot() {
        if (points_to_win <= 0)
            return true;
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
        var board = stateBeforeMove.board;
        if (board[row][col] < 0) {
            throw new Error("One can only make a move in an empty position!");
        }
        if (winOrNot()) {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = angular.copy(board);
        if (boardAfterMove[row][col] > 0) {
            points_to_win -= boardAfterMove[row][col];
            boardAfterMove[row][col] = -boardAfterMove[row][col];
        }
        else {
            boardAfterMove[row][col] = -1;
        }
        var winner = winOrNot();
        var turnIndex = turnIndexBeforeMove;
        if (winner)
            turnIndex = -1;
        else
            turnIndex = 1 - turnIndex;
        var delta = { row: row, col: col };
        var state = { delta: delta, board: boardAfterMove };
        return { turnIndex: turnIndex, state: state };
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