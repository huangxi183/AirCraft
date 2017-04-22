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
}
// head info
interface HeadPosi{
  index: number;
  x:number;
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
  export const ROWS = 12;
  export const COLS = 12;
  export let points_to_win = [10,10];
  let head : HeadPosi[][] = [];
  head[0] = [];
  head[1] = [];
  head[0][0] = getInitialHP()
  head[0][1] = getInitialHP();
  head[1][0] = getInitialHP();
  head[1][1] = getInitialHP();
  export function getInitialHP(){
    let temp :HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    return temp;
  }
  
  export function getInitialBoard(i:number): Board {
    let board: Board = [];
    // generate random craft head
    //head.index = Math.floor(Math.random() * 20) + 1;

    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = 0;
      }
    }
    
//-------1st aircraft---------------

    let first_aircraft_panel :number = Math.floor(Math.random() * 4) + 1;

    //choose a direction based on the head position
    if(head[i][0].index >=17 && head[i][0].index <=20){
      let rand: number = Math.floor(Math.random() * 2) +1;
      switch (head[i][0].index){
        case 17:
          if(rand == 1){
            head[i][0].direct = 1;
          }else{
            head[i][0].direct =2;
          }
          head[i][0].x = 2;
          head[i][0].y = 2;
          break;
        case 18:
          if(rand == 1){
            head[i][0].direct = 1;
          }else{
            head[i][0].direct =3;
          }
          head[i][0].x = 3;
          head[i][0].y = 2;
          break;
        case 19:
          if(rand == 1){
            head[i][0].direct = 2;
          }else{
            head[i][0].direct =4;
          }
          head[i][0].x = 2;
          head[i][0].y = 3;
          break;
        case 20:
          if(rand == 1){
            head[i][0].direct = 3;
          }else{
            head[i][0].direct = 4;
          }
          head[i][0].x = 3;
          head[i][0].y = 3;
          break;
      }
    }else if(head[i][0].index >=1 && head[i][0].index <=4){
      head[i][0].direct = 1;
      head[i][0].x = (head[i][0].index ===1 ||head[i][0].index == 3)?2:3;
      head[i][0].y = (head[i][0].index ===1 ||head[i][0].index == 2)?0:1;
    }else if(head[i][0].index >= 5 && head[i][0].index <=8){
      head[i][0].direct = 2;
      head[i][0].x = (head[i][0].index ===5 ||head[i][0].index == 7)?0:1;
      head[i][0].y = (head[i][0].index ===5 ||head[i][0].index == 6)?2:3;
    }else if(head[i][0].index >=9 && head[i][0].index <= 12){
      head[i][0].direct = 3;
      head[i][0].x = (head[i][0].index ===9 ||head[i][0].index == 11)?4:5;
      head[i][0].y = (head[i][0].index ===9 ||head[i][0].index == 10)?2:3;
    }else if(head[i][0].index >= 13 && head[i][0].index <=16){
      head[i][0].direct =4;
      head[i][0].x = (head[i][0].index ===13 ||head[i][0].index == 15)?2:3;
      head[i][0].y = (head[i][0].index ===13 ||head[i][0].index == 14)?4:5;
    }

    let x1 = 0;
    let y1 = 0;
    
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
    switch (head[i][0].direct){
      case 1:
        board[x1][y1] = 10;
        //body
        board[x1][y1+1] = 5;
        board[x1][y1+2] = 5;
        //wing
        board[x1-2][y1+1] = 2;
        board[x1-1][y1+1] = 2;
        board[x1+1][y1+1] = 2;
        board[x1+2][y1+1] = 2;
        //tail
        board[x1-1][y1+3] = 3;
        board[x1][y1+3] = 3;
        board[x1+1][y1+3] = 3;
        break;
      case 2:
        board[x1][y1] = 10;
        //body
        board[x1+1][y1] = 5;
        board[x1+2][y1] = 5;
        //wing
        board[x1+1][y1-2] = 2;
        board[x1+1][y1-1] = 2;
        board[x1+1][y1+1] = 2;
        board[x1+1][y1+2] = 2;
        //tail
        board[x1+3][y1-1] = 3;
        board[x1+3][y1+1] = 3;
        board[x1+3][y1] = 3;
        break;
      case 3:
        board[x1][y1] = 10;
        //body
        board[x1-1][y1] = 5;
        board[x1-2][y1] = 5;
        //wing
        board[x1-1][y1-2] = 2;
        board[x1-1][y1-1] = 2;
        board[x1-1][y1+1] = 2;
        board[x1-1][y1+2] = 2;
        //tail
        board[x1-3][y1-1] = 3;
        board[x1-3][y1+1] = 3;
        board[x1-3][y1] = 3;
        break;
      case 4:
        board[x1][y1] = 10;
        //body
        board[x1][y1-1] = 5;
        board[x1][y1-2] = 5;
        //wing
        board[x1-2][y1-1] = 2;
        board[x1-1][y1-1] = 2;
        board[x1+1][y1-1] = 2;
        board[x1+2][y1-1] = 2;
        //tail
        board[x1-1][y1-3] = 3;
        board[x1][y1-3] = 3;
        board[x1+1][y1-3] = 3;
        break;
    }

//-------1st aircraft---------------


//-------2nd aircraft----------------
    let second_aircraft_panel :number = (first_aircraft_panel + Math.floor(Math.random() * 3) + 1) % 4;
    if (second_aircraft_panel === 0) second_aircraft_panel = 4


    if(head[i][1].index >=17 && head[i][1].index <=20){
      let rand: number = Math.floor(Math.random() * 2) +1;
      switch (head[i][1].index){
        case 17:
          if(rand == 1){
            head[i][1].direct = 1;
          }else{
            head[i][1].direct =2;
          }
          head[i][1].x = 2;
          head[i][1].y = 2;
          break;
        case 18:
          if(rand == 1){
            head[i][1].direct = 1;
          }else{
            head[i][1].direct =3;
          }
          head[i][1].x = 3;
          head[i][1].y = 2;
          break;
        case 19:
          if(rand == 1){
            head[i][1].direct = 2;
          }else{
            head[i][1].direct =4;
          }
          head[i][1].x = 2;
          head[i][1].y = 3;
          break;
        case 20:
          if(rand == 1){
            head[i][1].direct = 3;
          }else{
            head[i][1].direct = 4;
          }
          head[i][1].x = 3;
          head[i][1].y = 3;
          break;
      }
    }else if(head[i][1].index >=1 && head[i][1].index <=4){
      head[i][1].direct = 1;
      head[i][1].x = (head[i][1].index ===1 ||head[i][1].index == 3)?2:3;
      head[i][1].y = (head[i][1].index ===1 ||head[i][1].index == 2)?0:1;
    }else if(head[i][1].index >= 5 && head[i][1].index <=8){
      head[i][1].direct = 2;
      head[i][1].x = (head[i][1].index ===5 ||head[i][1].index == 7)?0:1;
      head[i][1].y = (head[i][1].index ===5 ||head[i][1].index == 6)?2:3;
    }else if(head[i][1].index >=9 && head[i][1].index <= 12){
      head[i][1].direct = 3;
      head[i][1].x = (head[i][1].index ===9 ||head[i][1].index == 11)?4:5;
      head[i][1].y = (head[i][1].index ===9 ||head[i][1].index == 10)?2:3;
    }else if(head[i][1].index >= 13 && head[i][1].index <=16){
      head[i][1].direct =4;
      head[i][1].x = (head[i][1].index ===13 ||head[i][1].index == 15)?2:3;
      head[i][1].y = (head[i][1].index ===13 ||head[i][1].index == 14)?4:5;
    }

    let x2 = 0;
    let y2 = 0;

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
    switch (head[i][1].direct){
      case 1:
        board[x2][y2] = 10;
        //body
        board[x2][y2+1] = 5;
        board[x2][y2+2] = 5;
        //wing
        board[x2-2][y2+1] = 2;
        board[x2-1][y2+1] = 2;
        board[x2+1][y2+1] = 2;
        board[x2+2][y2+1] = 2;
        //tail
        board[x2-1][y2+3] = 3;
        board[x2][y2+3] = 3;
        board[x2+1][y2+3] = 3;
        break;
      case 2:
        board[x2][y2] = 10;
        //body
        board[x2+1][y2] = 5;
        board[x2+2][y2] = 5;
        //wing
        board[x2+1][y2-2] = 2;
        board[x2+1][y2-1] = 2;
        board[x2+1][y2+1] = 2;
        board[x2+1][y2+2] = 2;
        //tail
        board[x2+3][y2-1] = 3;
        board[x2+3][y2+1] = 3;
        board[x2+3][y2] = 3;
        break;
      case 3:
        board[x2][y2] = 10;
        //body
        board[x2-1][y2] = 5;
        board[x2-2][y2] = 5;
        //wing
        board[x2-1][y2-2] = 2;
        board[x2-1][y2-1] = 2;
        board[x2-1][y2+1] = 2;
        board[x2-1][y2+2] = 2;
        //tail
        board[x2-3][y2-1] = 3;
        board[x2-3][y2+1] = 3;
        board[x2-3][y2] = 3;
        break;
      case 4:
        board[x2][y2] = 10;
        //body
        board[x2][y2-1] = 5;
        board[x2][y2-2] = 5;
        //wing
        board[x2-2][y2-1] = 2;
        board[x2-1][y2-1] = 2;
        board[x2+1][y2-1] = 2;
        board[x2+2][y2-1] = 2;
        //tail
        board[x2-1][y2-3] = 3;
        board[x2][y2-3] = 3;
        board[x2+1][y2-3] = 3;
        break;
    }

  //-------2nd aircraft----------------
    return board;
  }
  

  export function getPTW(turnIndex: number){
    return points_to_win[turnIndex];
  }

  export function getInitialState(): IState {
    let temp_board_0 : Board = getInitialBoard(0);
    let temp_board_1 : Board = getInitialBoard(1);
    return {board: [temp_board_0, temp_board_1], delta: null};
  }

  function winOrNot(turnIndexBeforeMove: number): boolean {
    if (points_to_win[turnIndexBeforeMove] <= 0) {
      alert("Game Over!")
      return true;
    }
    else return false;
  }

  export function createMove(stateBeforeMove: IState,  row: number,col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    //same index = move board; otherwise show board
    let board: Board = stateBeforeMove.board[turnIndexBeforeMove];

    if (board[row][col] < 0) {
      throw new Error("One can only make a move in an empty position!");
    }
    if (winOrNot(turnIndexBeforeMove)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    if (boardAfterMove[row][col] > 0) {
      points_to_win[turnIndexBeforeMove] -= boardAfterMove[row][col];
      boardAfterMove[row][col] = -boardAfterMove[row][col];
    }
    else {
      boardAfterMove[row][col] = -1;
    }
    let finalboard: Board[] = [];
    finalboard[turnIndexBeforeMove] = boardAfterMove;
    finalboard[1-turnIndexBeforeMove] = stateBeforeMove.board[1-turnIndexBeforeMove];

    let winner = winOrNot(turnIndexBeforeMove);
    let turnIndex: number = turnIndexBeforeMove;
    let temp_score =[0,0];
    if (winner) {
      turnIndex = -1;
      temp_score[turnIndexBeforeMove] = 10 - points_to_win[turnIndexBeforeMove];
      temp_score[1-turnIndexBeforeMove] = 10 - points_to_win[1-turnIndexBeforeMove];
    }
    else {
      turnIndex = 1 - turnIndex;
      temp_score = null;
    }

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: finalboard};

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
