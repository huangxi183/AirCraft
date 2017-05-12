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
            //log.info(currentUpdateUI);
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
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        if (isComputerTurn() && game.state.delta == null)
            return;
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
        var move = aiService.findComputerMove(currentMove);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        // if(turnIndex == -2) return;
        game.didMakeMove = true;
        game.remain_score[turnIndex] = gameLogic.getPTW(move.state, turnIndex);
        //log.info(["let go",gameLogic.getPTW(move.state, turnIndex)]);
        //log.info(["lets go",remain_score[turnIndex]]);
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
        log.info("Clicked on cell:", row, col);
        if (!isMyTurn())
            return;
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
        if (turnIndex == -1)
            return;
        //log.info(state.board[turnIndex]);
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
        if (turnIndex == -1)
            return;
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
        if (turnIndex == -1)
            return;
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
        if (turnIndex == -1)
            return;
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
        if (turnIndex == -1)
            return;
        if (game.state.board[1 - turnIndex][row][col] < -1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.showDamagedCraft = showDamagedCraft;
    function showDamagedBlank(row, col) {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.board[1 - turnIndex][row][col] == -1)
            return true;
        else
            return false;
    }
    game.showDamagedBlank = showDamagedBlank;
    function showHp() {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        return game.currentUpdateUI.state ? game.currentUpdateUI.state.points_To_Win[1 - game.currentUpdateUI.yourPlayerIndex] : -1;
    }
    game.showHp = showHp;
    //--------->
    //-----------------Check location.
    /*
    export function isbody1(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.body1[1-turnIndex][0] == row && state.body1[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isbody2(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.body2[1-turnIndex][0] == row && state.body2[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isleftwing1(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.leftwing1[1-turnIndex][0] == row && state.leftwing1[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isleftwing2(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.leftwing2[1-turnIndex][0] == row && state.leftwing2[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isrightwing1(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.rightwing1[1-turnIndex][0] == row && state.rightwing1[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isrightwing2(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.rightwing2[1-turnIndex][0] == row && state.rightwing2[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function islefttail(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.lefttail[1-turnIndex][0] == row && state.lefttail[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function isrighttail(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.righttail[1-turnIndex][0] == row && state.righttail[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    export function ismidtail(row:number, col:number):boolean{
      if(isFirstMove()){
        return false;
      }
      let turnIndex: number;
      turnIndex = currentUpdateUI.yourPlayerIndex;
      if (state.midtail[1-turnIndex][0] == row && state.midtail[1-turnIndex][1] == col) {
        return true;
      }
      else {
        return false;
      }
    }
    */
    function isHeadTop(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.headLoc[1 - turnIndex][0] == row && game.state.headLoc[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isHeadTop = isHeadTop;
    function isHeadBottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.headLoc[1 - turnIndex][0] == row && game.state.headLoc[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isHeadBottom = isHeadBottom;
    function isHeadLeft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.headLoc[1 - turnIndex][0] == row && game.state.headLoc[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isHeadLeft = isHeadLeft;
    function isHeadRight(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.headLoc[1 - turnIndex][0] == row && game.state.headLoc[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isHeadRight = isHeadRight;
    function isBody1Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body1[1 - turnIndex][0] == row && game.state.body1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody1Top = isBody1Top;
    function isBody1Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body1[1 - turnIndex][0] == row && game.state.body1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody1Bottom = isBody1Bottom;
    function isBody1Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body1[1 - turnIndex][0] == row && game.state.body1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody1Left = isBody1Left;
    function isBody1Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body1[1 - turnIndex][0] == row && game.state.body1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody1Right = isBody1Right;
    function isBody2Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body2[1 - turnIndex][0] == row && game.state.body2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody2Top = isBody2Top;
    function isBody2Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body2[1 - turnIndex][0] == row && game.state.body2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody2Bottom = isBody2Bottom;
    function isBody2Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body2[1 - turnIndex][0] == row && game.state.body2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody2Left = isBody2Left;
    function isBody2Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.body2[1 - turnIndex][0] == row && game.state.body2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBody2Right = isBody2Right;
    function isLeftWing1Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing1[1 - turnIndex][0] == row && game.state.leftwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing1Top = isLeftWing1Top;
    function isLeftWing1Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing1[1 - turnIndex][0] == row && game.state.leftwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing1Bottom = isLeftWing1Bottom;
    function isLeftWing1Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing1[1 - turnIndex][0] == row && game.state.leftwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing1Left = isLeftWing1Left;
    function isLeftWing1Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing1[1 - turnIndex][0] == row && game.state.leftwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing1Right = isLeftWing1Right;
    function isLeftWing2Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing2[1 - turnIndex][0] == row && game.state.leftwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing2Top = isLeftWing2Top;
    function isLeftWing2Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing2[1 - turnIndex][0] == row && game.state.leftwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing2Bottom = isLeftWing2Bottom;
    function isLeftWing2Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing2[1 - turnIndex][0] == row && game.state.leftwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing2Left = isLeftWing2Left;
    function isLeftWing2Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.leftwing2[1 - turnIndex][0] == row && game.state.leftwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftWing2Right = isLeftWing2Right;
    function isRightWing1Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing1[1 - turnIndex][0] == row && game.state.rightwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing1Top = isRightWing1Top;
    function isRightWing1Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing1[1 - turnIndex][0] == row && game.state.rightwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing1Bottom = isRightWing1Bottom;
    function isRightWing1Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing1[1 - turnIndex][0] == row && game.state.rightwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing1Left = isRightWing1Left;
    function isRightWing1Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing1[1 - turnIndex][0] == row && game.state.rightwing1[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing1Right = isRightWing1Right;
    function isRightWing2Top(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing2[1 - turnIndex][0] == row && game.state.rightwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing2Top = isRightWing2Top;
    function isRightWing2Bottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing2[1 - turnIndex][0] == row && game.state.rightwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing2Bottom = isRightWing2Bottom;
    function isRightWing2Left(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing2[1 - turnIndex][0] == row && game.state.rightwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing2Left = isRightWing2Left;
    function isRightWing2Right(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.rightwing2[1 - turnIndex][0] == row && game.state.rightwing2[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightWing2Right = isRightWing2Right;
    function isMidTailTop(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.midtail[1 - turnIndex][0] == row && game.state.midtail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isMidTailTop = isMidTailTop;
    function isMidTailBottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.midtail[1 - turnIndex][0] == row && game.state.midtail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isMidTailBottom = isMidTailBottom;
    function isMidTailLeft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.midtail[1 - turnIndex][0] == row && game.state.midtail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isMidTailLeft = isMidTailLeft;
    function isMidTailRight(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.midtail[1 - turnIndex][0] == row && game.state.midtail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isMidTailRight = isMidTailRight;
    function isLeftTailTop(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.lefttail[1 - turnIndex][0] == row && game.state.lefttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftTailTop = isLeftTailTop;
    function isLeftTailBottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.lefttail[1 - turnIndex][0] == row && game.state.lefttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftTailBottom = isLeftTailBottom;
    function isLeftTailLeft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.lefttail[1 - turnIndex][0] == row && game.state.lefttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftTailLeft = isLeftTailLeft;
    function isLeftTailRight(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.lefttail[1 - turnIndex][0] == row && game.state.lefttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isLeftTailRight = isLeftTailRight;
    function isRightTailTop(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.righttail[1 - turnIndex][0] == row && game.state.righttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightTailTop = isRightTailTop;
    function isRightTailBottom(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.righttail[1 - turnIndex][0] == row && game.state.righttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 2) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightTailBottom = isRightTailBottom;
    function isRightTailLeft(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.righttail[1 - turnIndex][0] == row && game.state.righttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightTailLeft = isRightTailLeft;
    function isRightTailRight(row, col) {
        if (isFirstMove()) {
            return false;
        }
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        if (game.state.righttail[1 - turnIndex][0] == row && game.state.righttail[1 - turnIndex][1] == col && game.state.direction[1 - turnIndex] == 4) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRightTailRight = isRightTailRight;
    // export function shouldShowBomb():boolean{
    //   let turnIndex:number;
    //   turnIndex = 1- currentUpdateUI.yourPlayerIndex;
    //   if(a[turnIndex] > remain_score[turnIndex]){
    //     //a[turnIndex] = remain_score[turnIndex];
    //     return true;
    //   }else{
    //     return false;
    //   }
    // }
    //-----------------Check location.
    function shouldShowImage(row, col) {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (turnIndex == -1)
            return;
        return game.state.board[turnIndex][row][col] <= -1;
    }
    game.shouldShowImage = shouldShowImage;
    function shouldSlowlyAppear(row, col) {
        if (game.state.delta == null)
            return;
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