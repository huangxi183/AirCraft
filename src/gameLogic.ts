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
  headLoc:number[][];
  body1:number[][];
  body2:number[][];
  leftwing1:number[][];
  leftwing2:number[][];
  rightwing1:number[][];
  rightwing2:number[][];
  lefttail:number[][];
  midtail:number[][];
  righttail:number[][];
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
  export function getInitialHeadPosition(){
    let temp :HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    return temp;
  }
    //  HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
  /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(i:number): Board {
    let board: Board = [];
    let head : HeadPosi[] = [];
    head[i] = getInitialHeadPosition();
    //head[1] = getInitialHeadPosition();
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
    let _headLoc:number[][] = [];
    _headLoc[0] = [0, 0];
    _headLoc[1] = [0, 0];
    let _body1:number[][] = [];
    _body1[0] = [0, 0];
    _body1[1] = [0, 0];
    let _body2:number[][] = [];
    _body2[0] = [0, 0];
    _body2[1] = [0, 0];
    let _leftwing1:number[][] = [];
    _leftwing1[0] = [0, 0];
    _leftwing1[1] = [0, 0];
    let _leftwing2:number[][] = [];
    _leftwing2[0] = [0, 0];
    _leftwing2[1] = [0, 0];
    let _rightwing1:number[][] = [];
    _rightwing1[0] = [0, 0];
    _rightwing1[1] = [0, 0];
    let _rightwing2:number[][] = [];
    _rightwing2[0] = [0, 0];
    _rightwing2[1] = [0, 0];
    let _lefttail:number[][] = [];
    _lefttail[0] = [0, 0];
    _lefttail[1] = [0, 0];
    let _midtail:number[][] = [];
    _midtail[0] = [0, 0];
    _midtail[1] = [0, 0];
    let _righttail:number[][] = [];
    _righttail[0] = [0, 0];
    _righttail[1] = [0, 0];

    let temp_board_0 : Board = getInitialBoard(0);
    let temp_board_1 : Board = getInitialBoard(1);

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
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
          }

          // Head toward left.
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
          }

          // Head toward bottom.
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
          }

          // Head toward top.
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
          }
        }

        // Head at top edge.
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
        }

        // Head at bottom edge.
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
        }

        // Head at left edge.
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
        }

        // Head at right edge.
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
          }

          // Head toward left.
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
          }

          // Head toward bottom.
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
          }

          // Head toward top.
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
          }
        }

        // Head at top edge.
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
        }

        // Head at bottom edge.
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
        }

        // Head at left edge.
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
        }

        // Head at right edge.
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
        }
        //---------For the second aircraft.
      }
    }
    
    return {board: [temp_board_0, temp_board_1], delta: null, points_To_Win: [10, 10], headLoc:_headLoc, body1:_body1, body2:_body2, 
      leftwing1:_leftwing1, leftwing2:_leftwing2, rightwing1:_rightwing1, rightwing2:_rightwing2, lefttail:_lefttail, midtail:_midtail, righttail:_righttail};
  }

  function winOrNot(turnIndexBeforeMove: number, state:IState): boolean {
    if (state.points_To_Win[turnIndexBeforeMove] <= 0 && state.points_To_Win[1 - turnIndexBeforeMove] > 0) {
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
    let headLoc = angular.copy(stateBeforeMove.headLoc);
    let body1 = angular.copy(stateBeforeMove.body1);
    let body2 = angular.copy(stateBeforeMove.body2);
    let leftwing1 = angular.copy(stateBeforeMove.leftwing1);
    let leftwing2 = angular.copy(stateBeforeMove.leftwing2);
    let rightwing1 = angular.copy(stateBeforeMove.rightwing1);
    let rightwing2 = angular.copy(stateBeforeMove.rightwing2);
    let lefttail = angular.copy(stateBeforeMove.lefttail);
    let righttail = angular.copy(stateBeforeMove.righttail);
    let midtail = angular.copy(stateBeforeMove.midtail);

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

    //-----
    let new_points_To_Win = points_To_Win;
    let new_delta: BoardDelta = {row: row, col: col};
    let new_state: IState = {delta: new_delta, board: finalboard, points_To_Win: new_points_To_Win,
    headLoc, body1, body2, leftwing1, leftwing2, rightwing1, rightwing2, lefttail, righttail, midtail};
    //-----

    let winner = winOrNot(turnIndexBeforeMove, new_state);
    let turnIndex: number = turnIndexBeforeMove;
    let endMatchScores =[0,0];
    if (winner) {
      turnIndex = -1;
      endMatchScores[turnIndexBeforeMove] = 10 - points_To_Win[turnIndexBeforeMove];
      endMatchScores[1-turnIndexBeforeMove] = 10 - points_To_Win[1-turnIndexBeforeMove];
    }
    else {
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: finalboard, points_To_Win: points_To_Win,
    headLoc, body1, body2, leftwing1, leftwing2, rightwing1, rightwing2, lefttail, righttail, midtail};

    //endMatchScores: number[];
    return {turnIndex: turnIndex, state: state, endMatchScores: endMatchScores};
  }
  
  export function createInitialMove(): number {
    return 0;
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
