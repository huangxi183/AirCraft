type Board = number[][]; 
//>=0:blank
// == -1:grey
//<-1:red

interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;

interface IState {
  board: Board[];
  delta: BoardDelta;
  points_To_Win: number[];
}
// head info
interface HeadPosi{
  index: number;
  x:number
  y:number;
  direct:number;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 6;
  export const COLS = 6;
  export function getInitialHP(){
    let temp :HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    return temp;
  }
    //  HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
  /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(i:number): Board {
    let board: Board = [];
    let head : HeadPosi[] = [];
    head[0] = getInitialHP();
    head[1] = getInitialHP();
    // generate random craft head
    //head.index = Math.floor(Math.random() * 20) + 1;

    //choose a direction based on the head position
    if(head[i].index >=17 && head[i].index <=20){
      let rand: number = Math.floor(Math.random() * 2) +1;
      switch (head[i].index){
        case 17:
          if(rand == 1){
            head[i].direct = 1;
          }else{
            head[i].direct =2;
          }
          head[i].x = 2;
          head[i].y = 2;
          break;
        case 18:
          if(rand == 1){
            head[i].direct = 1;
          }else{
            head[i].direct =3;
          }
          head[i].x = 3;
          head[i].y = 2;
          break;
        case 19:
          if(rand == 1){
            head[i].direct = 2;
          }else{
            head[i].direct =4;
          }
          head[i].x = 2;
          head[i].y = 3;
          break;
        case 20:
          if(rand == 1){
            head[i].direct = 3;
          }else{
            head[i].direct = 4;
          }
          head[i].x = 3;
          head[i].y = 3;
          break;
      }
    }else if(head[i].index >=1 && head[i].index <=4){
      head[i].direct = 1;
      head[i].x = (head[i].index ===1 ||head[i].index == 3)?2:3;
      head[i].y = (head[i].index ===1 ||head[i].index == 2)?0:1;
    }else if(head[i].index >= 5 && head[i].index <=8){
      head[i].direct = 2;
      head[i].x = (head[i].index ===5 ||head[i].index == 7)?0:1;
      head[i].y = (head[i].index ===5 ||head[i].index == 6)?2:3;
    }else if(head[i].index >=9 && head[i].index <= 12){
      head[i].direct = 3;
      head[i].x = (head[i].index ===9 ||head[i].index == 11)?4:5;
      head[i].y = (head[i].index ===9 ||head[i].index == 10)?2:3;
    }else if(head[i].index >= 13 && head[i].index <=16){
      head[i].direct =4;
      head[i].x = (head[i].index ===13 ||head[i].index == 15)?2:3;
      head[i].y = (head[i].index ===13 ||head[i].index == 14)?4:5;
    }

    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = 0;
      }
    }
    let x = head[i].x;
    let y = head[i].y;

    //initial aircraft in board
    switch (head[i].direct){
      case 1:
        board[x][y] = 10;
        //body
        board[x][y+1] = 5;
        board[x][y+2] = 5;
        //wing
        board[x-2][y+1] = 2;
        board[x-1][y+1] = 2;
        board[x+1][y+1] = 2;
        board[x+2][y+1] = 2;
        //tail
        board[x-1][y+3] = 3;
        board[x][y+3] = 3;
        board[x+1][y+3] = 3;
        break;
      case 2:
        board[x][y] = 10;
        //body
        board[x+1][y] = 5;
        board[x+2][y] = 5;
        //wing
        board[x+1][y-2] = 2;
        board[x+1][y-1] = 2;
        board[x+1][y+1] = 2;
        board[x+1][y+2] = 2;
        //tail
        board[x+3][y-1] = 3;
        board[x+3][y+1] = 3;
        board[x+3][y] = 3;
        break;
      case 3:
        board[x][y] = 10;
        //body
        board[x-1][y] = 5;
        board[x-2][y] = 5;
        //wing
        board[x-1][y-2] = 2;
        board[x-1][y-1] = 2;
        board[x-1][y+1] = 2;
        board[x-1][y+2] = 2;
        //tail
        board[x-3][y-1] = 3;
        board[x-3][y+1] = 3;
        board[x-3][y] = 3;
        break;
      case 4:
        board[x][y] = 10;
        //body
        board[x][y-1] = 5;
        board[x][y-2] = 5;
        //wing
        board[x-2][y-1] = 2;
        board[x-1][y-1] = 2;
        board[x+1][y-1] = 2;
        board[x+2][y-1] = 2;
        //tail
        board[x-1][y-3] = 3;
        board[x][y-3] = 3;
        board[x+1][y-3] = 3;
        break;
    }


    return board;
  }

  export function getPTW(state:IState, turnIndex: number): number {
    return state.points_To_Win[turnIndex];
  }

  export function getInitialState(): IState {
    let temp_board_0 : Board = getInitialBoard(0);
    let temp_board_1 : Board = getInitialBoard(1);
    return {board: [temp_board_0, temp_board_1], delta: null, points_To_Win: [10, 10]};
  }

  function winOrNot(turnIndexBeforeMove: number, state:IState): boolean {
    if (state.points_To_Win[turnIndexBeforeMove] <= 0) {
      return true;
    }
    else return false;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(stateBeforeMove: IState,  row: number,col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    //same index = move board; otherwise show board
    let board: Board = stateBeforeMove.board[turnIndexBeforeMove];

    if (board[row][col] < 0) {
      throw new Error("One can only make a move in an empty position!");
    }
    if (winOrNot(turnIndexBeforeMove, stateBeforeMove)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    let points_To_Win = angular.copy(stateBeforeMove.points_To_Win);
    if (boardAfterMove[row][col] > 0) {
      points_To_Win[turnIndexBeforeMove] -= boardAfterMove[row][col];
      boardAfterMove[row][col] = -boardAfterMove[row][col];
    }
    else {
      boardAfterMove[row][col] = -1;
    }
    let finalboard: Board[] = [];
    finalboard[turnIndexBeforeMove] = boardAfterMove;
    finalboard[1-turnIndexBeforeMove] = stateBeforeMove.board[1-turnIndexBeforeMove];

    let winner = winOrNot(turnIndexBeforeMove, stateBeforeMove);
    let turnIndex: number = turnIndexBeforeMove;
    let temp_score =[0,0];
    if (winner) {
      turnIndex = -1;
      temp_score[turnIndexBeforeMove] = 10 - points_To_Win[turnIndexBeforeMove];
      temp_score[1-turnIndexBeforeMove] = 10 - points_To_Win[1-turnIndexBeforeMove];
      /*
      points_to_win[0] = 10;
      points_to_win[1] = 10;
      head[0] = getInitialHP();
      head[1] = getInitialHP();
      */
    }
    else {
      turnIndex = 1 - turnIndex;
      temp_score = null;
    }

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: finalboard, points_To_Win: points_To_Win};

    //endMatchScores: number[];
    return {turnIndex: turnIndex, state: state, endMatchScores: temp_score};
  }
  
  export function createInitialMove(): number {
    return 0;
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
