interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

module game {
  export let $rootScope: angular.IScope = null;
  export let $timeout: angular.ITimeoutService = null;
  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  export let proposals: number[][] = null;
  export let remain_score : number[] = [10,10];
  //export let yourPlayerInfo: IPlayerInfo = null;

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(2);
    gameService.setGame({
      updateUI: updateUI,
      getStateForOgImage: null,
    });
  }

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
    return {};
  }

  export function getCellStyle(row: number, col: number) {
    let scale = 1.0;
    let opacity = 0.5;
    return {
      transform: `scale(${scale}, ${scale})`,
      opacity: "" + opacity,
    };
  }
  
  export function updateUI(params: IUpdateUI): void {
    log.info("Sue got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    if (params.yourPlayerIndex == -2) params.yourPlayerIndex = 0;
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.state;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      log.info(currentUpdateUI);
      remain_score[0] = 10;
      remain_score[1] = 10;
      let move:IMove = {
        turnIndex: 0,
        state: state,
        endMatchScores:null,
      };
      //makeMove(move);
    }
    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 500);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    didMakeMove = true;
    remain_score[turnIndex] = gameLogic.getPTW(move.state, turnIndex);
    log.info(["let go",gameLogic.getPTW(move.state, turnIndex)]);
    log.info(["lets go",remain_score[turnIndex]]);
    gameService.makeMove(move,null,"Move Made");
  }

  function isFirstMove() {
    return !currentUpdateUI.state;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
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
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.turnIndex >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.turnIndex; // it's my turn
  }

  export function cellClicked(row: number, col: number): void {
    if (!isMyTurn()) return;
    log.info("Clicked on cell:", row, col);
    let nextMove: IMove;
    try {
      nextMove = gameLogic.createMove(
          state,  row,col, currentUpdateUI.turnIndex);
    } catch (e) {
      //log.info(e);
      log.info(["Cell has been explored:", row,col]);
      return;
    }

    // Move is legal, make it!
    makeMove(nextMove);
  }

  // export function cellHover(row: number, col: number): void{
  //   log.info("Hover on cell: ", row, col);
  //   if(gameLogic.)
  // }

  // function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
  //   return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
  // }

  //<------ add game control two functions by:jam
  export function isPieceHit(row: number, col: number): boolean{
    let temp_pro: boolean;
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    log.info(state.board[turnIndex]);
    if(state.board[turnIndex][row][col] < -1){
      return true;
    }
    else
      return false;
  }

  export function isPieceBlank(row: number, col:number): boolean{
    let temp_pro: boolean;
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[turnIndex][row][col] == -1){
      return true;
    }else
      return false;
  }

  export function showCraft(row: number, col:number): boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    //if(state.board[1-turnIndex][row][col] > 1 || state.board[1-turnIndex][row][col] < -1)
    if(state.board[1-turnIndex][row][col] >= 1)
      return true;
    else
      return false;
  }
  export function showBlank(row: number, col:number): boolean{
    if(isFirstMove()){
      return true;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] == 0)
      return true;
    else
      return false;
  }
  export function showDamagedCraft(row:number, col:number): boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] < -1)
      return true;
    else
      return false;
  }
  export function showDamagedBlank(row:number, col:number): boolean{
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] == -1)
      return true;
    else
      return false;
  }

  export function showHp(): number{
    return currentUpdateUI.state ? currentUpdateUI.state.points_To_Win[1 - currentUpdateUI.yourPlayerIndex] : -1;
  }
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
  export function isHeadTop(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.headLoc[1-turnIndex][0] == row && state.headLoc[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isHeadBottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.headLoc[1-turnIndex][0] == row && state.headLoc[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isHeadLeft(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.headLoc[1-turnIndex][0] == row && state.headLoc[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isHeadRight(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.headLoc[1-turnIndex][0] == row && state.headLoc[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody1Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body1[1-turnIndex][0] == row && state.body1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody1Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body1[1-turnIndex][0] == row && state.body1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody1Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body1[1-turnIndex][0] == row && state.body1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody1Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body1[1-turnIndex][0] == row && state.body1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody2Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body2[1-turnIndex][0] == row && state.body2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody2Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body2[1-turnIndex][0] == row && state.body2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody2Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body2[1-turnIndex][0] == row && state.body2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isBody2Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.body2[1-turnIndex][0] == row && state.body2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing1Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing1[1-turnIndex][0] == row && state.leftwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing1Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing1[1-turnIndex][0] == row && state.leftwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing1Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing1[1-turnIndex][0] == row && state.leftwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing1Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing1[1-turnIndex][0] == row && state.leftwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing2Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing2[1-turnIndex][0] == row && state.leftwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing2Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing2[1-turnIndex][0] == row && state.leftwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing2Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing2[1-turnIndex][0] == row && state.leftwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftWing2Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.leftwing2[1-turnIndex][0] == row && state.leftwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing1Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing1[1-turnIndex][0] == row && state.rightwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing1Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing1[1-turnIndex][0] == row && state.rightwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing1Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing1[1-turnIndex][0] == row && state.rightwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing1Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing1[1-turnIndex][0] == row && state.rightwing1[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing2Top(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing2[1-turnIndex][0] == row && state.rightwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing2Bottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing2[1-turnIndex][0] == row && state.rightwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing2Left(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing2[1-turnIndex][0] == row && state.rightwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightWing2Right(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.rightwing2[1-turnIndex][0] == row && state.rightwing2[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isMidTailTop(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.midtail[1-turnIndex][0] == row && state.midtail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isMidTailBottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.midtail[1-turnIndex][0] == row && state.midtail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isMidTailLeft(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.midtail[1-turnIndex][0] == row && state.midtail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isMidTailRight(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.midtail[1-turnIndex][0] == row && state.midtail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftTailTop(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.lefttail[1-turnIndex][0] == row && state.lefttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftTailBottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.lefttail[1-turnIndex][0] == row && state.lefttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftTailLeft(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.lefttail[1-turnIndex][0] == row && state.lefttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isLeftTailRight(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.lefttail[1-turnIndex][0] == row && state.lefttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightTailTop(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.righttail[1-turnIndex][0] == row && state.righttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightTailBottom(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.righttail[1-turnIndex][0] == row && state.righttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 2) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightTailLeft(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.righttail[1-turnIndex][0] == row && state.righttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 3) {
      return true;
    }
    else {
      return false;
    }
  }

  export function isRightTailRight(row:number, col:number):boolean{
    if(isFirstMove()){
      return false;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if (state.righttail[1-turnIndex][0] == row && state.righttail[1-turnIndex][1] == col && state.direction[1-turnIndex] == 4) {
      return true;
    }
    else {
      return false;
    }
  }
  //-----------------Check location.


  export function shouldShowImage(row: number, col: number): boolean {
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    return state.board[turnIndex][row][col] <= -1;
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return state.delta &&
        state.delta.row === row && state.delta.col === col;
  }
}

angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      $rootScope['hp'] = ()=>game.remain_score[game.currentUpdateUI.yourPlayerIndex];
      game.init($rootScope, $timeout);
    }]);

    // var myapp = angular.module('myHp',[]);
// myapp.controller('myCtrl_2',function ($scope) {
//   $scope.score =game.remain_score[game.currentUpdateUI.yourPlayerIndex];
// });
