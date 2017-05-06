;
var game;
(function (game) {
    game.$rootScope = null;
    game.$timeout = null;
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.proposals = null;
    game.remain_score = [10, 10];
    //export let yourPlayerInfo: IPlayerInfo = null;
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(2);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
    }
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker
        // (because iOS doesn't support serviceWorker, so we have to use appCache)
        // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {};
    }
    function getCellStyle(row, col) {
        var scale = 1.0;
        var opacity = 0.5;
        return {
            transform: "scale(" + scale + ", " + scale + ")",
            opacity: "" + opacity,
        };
    }
    game.getCellStyle = getCellStyle;
    function updateUI(params) {
        log.info("Sue got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        if (params.yourPlayerIndex == -2)
            params.yourPlayerIndex = 0;
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.state;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
            log.info(game.currentUpdateUI);
            game.remain_score[0] = 10;
            game.remain_score[1] = 10;
            var move = {
                turnIndex: 0,
                state: game.state,
                endMatchScores: null,
            };
            //makeMove(move);
        }
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(animationEndedCallback, 500);
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        game.didMakeMove = true;
        game.remain_score[turnIndex] = gameLogic.getPTW(move.state, turnIndex);
        log.info(["let go", gameLogic.getPTW(move.state, turnIndex)]);
        log.info(["lets go", game.remain_score[turnIndex]]);
        gameService.makeMove(move, null, "Move Made");
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
        // In community games, playersInfo is [].
        return playerInfo && playerInfo.playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.turnIndex >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex; // it's my turn
    }
    function cellClicked(row, col) {
        if (!isMyTurn())
            return;
        log.info("Clicked on cell:", row, col);
        var nextMove;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, game.currentUpdateUI.turnIndex);
        }
        catch (e) {
            //log.info(e);
            log.info(["Cell has been explored:", row, col]);
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.cellClicked = cellClicked;
    // export function cellHover(row: number, col: number): void{
    //   log.info("Hover on cell: ", row, col);
    //   if(gameLogic.)
    // }
    // function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
    //   return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
    // }
    //<------ add game control two functions by:jam
    function isPieceHit(row, col) {
        var temp_pro;
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        log.info(game.state.board[turnIndex]);
        if (game.state.board[turnIndex][row][col] < -1) {
            return true;
        }
        else
            return false;
    }
    game.isPieceHit = isPieceHit;
    function isPieceBlank(row, col) {
        var temp_pro;
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[turnIndex][row][col] == -1) {
            return true;
        }
        else
            return false;
    }
    game.isPieceBlank = isPieceBlank;
    function showCraft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        //if(state.board[1-turnIndex][row][col] > 1 || state.board[1-turnIndex][row][col] < -1)
        if (game.state.board[1 - turnIndex][row][col] >= 1)
            return true;
        else
            return false;
    }
    game.showCraft = showCraft;
    function showBlank(row, col) {
        if (isFirstMove()) {
            return true;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[1 - turnIndex][row][col] == 0)
            return true;
        else
            return false;
    }
    game.showBlank = showBlank;
    function showDamagedCraft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[1 - turnIndex][row][col] < -1)
            return true;
        else
            return false;
    }
    game.showDamagedCraft = showDamagedCraft;
    function showDamagedBlank(row, col) {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[1 - turnIndex][row][col] == -1)
            return true;
        else
            return false;
    }
    game.showDamagedBlank = showDamagedBlank;
    /*
      export function showHp(): number{
        if(currentUpdateUI.state){
          return currentUpdateUI.state.points_To_Win[1-currentUpdateUI.yourPlayerIndex];
        }
        return -1;
      }
    */
    function showHp() {
        return game.currentUpdateUI.state ? game.currentUpdateUI.state.points_To_Win[1 - game.currentUpdateUI.yourPlayerIndex] : -1;
    }
    game.showHp = showHp;
    function showOpHp() {
        return game.currentUpdateUI.state ? game.currentUpdateUI.state.points_To_Win[game.currentUpdateUI.yourPlayerIndex] : -1;
    }
    game.showOpHp = showOpHp;
    function showHP_1() {
        if (showHp() == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.showHP_1 = showHP_1;
    function showHP_2() {
        if (showHp() === 2)
            return true;
        else
            return false;
    }
    game.showHP_2 = showHP_2;
    function showHP_3() {
        if (showHp() === 3)
            return true;
        else
            return false;
    }
    game.showHP_3 = showHP_3;
    function showHP_4() {
        if (showHp() === 4)
            return true;
        else
            return false;
    }
    game.showHP_4 = showHP_4;
    function showHP_5() {
        if (showHp() === 5)
            return true;
        else
            return false;
    }
    game.showHP_5 = showHP_5;
    function showHP_6() {
        if (showHp() === 6)
            return true;
        else
            return false;
    }
    game.showHP_6 = showHP_6;
    function showHP_7() {
        if (showHp() === 7)
            return true;
        else
            return false;
    }
    game.showHP_7 = showHP_7;
    function showHP_8() {
        if (showHp() === 8)
            return true;
        else
            return false;
    }
    game.showHP_8 = showHP_8;
    function showHP_9() {
        if (showHp() === 9)
            return true;
        else
            return false;
    }
    game.showHP_9 = showHP_9;
    function showHP_10() {
        if (showHp() == 10) {
            return true;
        }
        else {
            return false;
        }
    }
    game.showHP_10 = showHP_10;
    //--------->
    function shouldShowImage(row, col) {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        return game.state.board[turnIndex][row][col] <= -1;
    }
    game.shouldShowImage = shouldShowImage;
    function shouldSlowlyAppear(row, col) {
        return game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        $rootScope['hp'] = function () { return game.remain_score[game.currentUpdateUI.yourPlayerIndex]; };
        game.init($rootScope, $timeout);
    }]);
// var myapp = angular.module('myHp',[]);
// myapp.controller('myCtrl_2',function ($scope) {
//   $scope.score =game.remain_score[game.currentUpdateUI.yourPlayerIndex];
// });
//# sourceMappingURL=game.js.map