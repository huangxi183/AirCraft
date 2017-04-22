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
            communityUI: communityUI,
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
    function communityUI(communityUI) {
        currentCommunityUI = communityUI;
        log.info("Game got communityUI:", communityUI);
        // If only proposals changed, then do NOT call updateUI. Then update proposals.
        var nextUpdateUI = {
            playersInfo: [],
            playMode: communityUI.yourPlayerIndex,
            numberOfPlayers: communityUI.numberOfPlayers,
            state: communityUI.state,
            turnIndex: communityUI.turnIndex,
            endMatchScores: communityUI.endMatchScores,
            yourPlayerIndex: communityUI.yourPlayerIndex,
        };
        if (angular.equals(yourPlayerInfo, communityUI.yourPlayerInfo) &&
            game.currentUpdateUI && angular.equals(game.currentUpdateUI, nextUpdateUI)) {
        }
        else {
            // Things changed, so call updateUI.
            updateUI(nextUpdateUI);
        }
        // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
        yourPlayerInfo = communityUI.yourPlayerInfo;
        var playerIdToProposal = communityUI.playerIdToProposal;
        game.didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
        game.proposals = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            game.proposals[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                game.proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            game.proposals[delta.row][delta.col]++;
        }
    }
    game.communityUI = communityUI;
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
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
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.state;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
            log.info(game.currentUpdateUI);
            var move = {
                turnIndex: 0,
                state: game.state,
                endMatchScores: null,
            };
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
        game.remain_score[turnIndex] = gameLogic.getPTW();
        gameService.makeMove(move);
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state;
    }
    function cellClicked(row, col) {
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
        temp_pro = (isProposal(row, col) && game.currentUpdateUI.turnIndex == turnIndex);
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
        temp_pro = (isProposal(row, col) && game.currentUpdateUI.turnIndex == turnIndex);
        if (game.state.board[turnIndex][row][col] == -1) {
            return true;
        }
        else
            return false;
    }
    game.isPieceBlank = isPieceBlank;
    function showCraft(row, col) {
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
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[1 - turnIndex][row][col] < 1 && game.state.board[1 - turnIndex][row][col] >= -1)
            return true;
        else
            return false;
    }
    game.showBlank = showBlank;
    function showDamagedCraft(row, col) {
        var turnIndex;
        turnIndex = game.currentUpdateUI.yourPlayerIndex;
        if (game.state.board[1 - turnIndex][row][col] < -1)
            return true;
        else
            return false;
    }
    game.showDamagedCraft = showDamagedCraft;
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
        game.init($rootScope, $timeout);
    }]);
// var myapp = angular.module('myHp',[]);
// myapp.controller('myCtrl_2',function ($scope) {
//   $scope.score =game.remain_score[game.currentUpdateUI.yourPlayerIndex];
// });
//# sourceMappingURL=game.js.map