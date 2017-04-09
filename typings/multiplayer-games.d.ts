
interface IGameService {
  setGame(game: IGame): void;

  makeMove(move: IMove): void;
}

interface IGame {
  updateUI(updateUI: IUpdateUI): void;
}

interface IMove {
  turnIndex: number;

  state: IState;
}

interface IPlayerInfo {
  avatarImageUrl: string;

  displayName: string;

  playerId: string;
}

interface ICommonUI extends IMove {
  numberOfPlayers: number;

  yourPlayerIndex: number;
}

declare type PlayMode = string | number;

interface IUpdateUI extends ICommonUI {
  playersInfo: IPlayerInfo[];
  playMode: PlayMode; 
}

interface ICommunityUI extends ICommonUI {
  yourPlayerInfo: IPlayerInfo;
  
  playerIdToProposal: IProposals;
  
  numberOfPlayersRequiredToMove: number;
}

// A mapping of playerId to proposal.
interface IProposals {
  [playerId: string]: IProposal;
}

interface IProposal {
  playerInfo: IPlayerInfo; // the player making the proposal.
  chatDescription: string; // string representation of the proposal that will be shown in the community game chat.
  data: IProposalData; // IProposalData must be defined by the game.
}

interface IAlphaBetaService {
  alphaBetaDecision(
    move: IMove,
    playerIndex: number,
    getNextStates: (state: IMove, playerIndex: number) => IMove[],
    getStateScoreForIndex0: (move: IMove, playerIndex: number) => number,
    // If you want to see debugging output in the console, then surf to index.html?debug
    getDebugStateToString: (move: IMove) => string,
    alphaBetaLimits: IAlphaBetaLimits): IMove;
}
interface IAlphaBetaLimits {
  millisecondsLimit? : number;
  maxDepth? : number;
}

interface ITranslateService {
  (translationId: string, interpolateParams?: StringDictionary, languageCode?: string): string;
  getLanguage(): string;
  setTranslations(idToLanguageToL10n: Translations): void;
  setLanguage(languageCode: string): void;
}
interface Translations {
  [index: string]: SupportedLanguages;
}
interface StringDictionary {
  [index: string]: string;
}

interface IResizeGameAreaService {
  setWidthToHeight(widthToHeightRatio: number,
    dimensionsChanged?: (gameAreaWidth: number, gameAreaHeight: number)=>void): void;
}

interface ILog {
  info(... args: any[]):void;
  debug(... args: any[]):void;
  warn(... args: any[]):void;
  error(... args: any[]):void;
  log(... args: any[]):void;

  alwaysLog(... args: any[]):void;
}

interface IDragAndDropService {
  addDragListener(touchElementId: string,
      handleDragEvent: (type: string, clientX: number, clientY: number, event: TouchEvent|MouseEvent) => void): void;
}

declare namespace gamingPlatform {
  var gameService: IGameService;
  var alphaBetaService: IAlphaBetaService;
  var translate: ITranslateService;
  var resizeGameAreaService: IResizeGameAreaService;
  var log:ILog;
  var dragAndDropService: IDragAndDropService;
}