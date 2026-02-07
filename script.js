function Gameboard() {

    const board = [];

    for ( let i = 0; i < 9; i++ ) {
        board.push( Cell() );
    }


    const getBoard = () => board;

    const addBoardMark = ( cell, player ) => {
        board[ cell ].addMark( player );
    };

    const resetBoard = () => {
        board.forEach( cell => {
            cell.changeValue( "" );
            if ( cell.getCellState() ) cell.changeCellState();
        } )
    }

    return { getBoard, addBoardMark, resetBoard };
}

function Cell() {
    let value = "";
    let cellState = false;

    const addMark = ( playerMark ) => {
        value = playerMark;
    };

    const changeCellState = () => ( cellState ) ? cellState = false : cellState = true;

    const changeValue = ( newValue ) => value = newValue;

    const getValue = () => value;

    const getCellState = () => cellState;

    return {
        addMark,
        getValue,
        changeCellState,
        getCellState,
        changeValue
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Computer"
) {
    const board = Gameboard();

    let players = [
        {
            name: playerOneName,
            token: "X",
            wins: 0,
        },
        {
            name: playerTwoName,
            token: "O",
            wins: 0,
        }
    ];

    let boardState = true;

    let activePlayer = players[ 0 ];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[ 0 ] ? players[ 1 ] : players[ 0 ];
    };

    const getActivePlayer = () => activePlayer;

    const playRound = ( cell ) => {
        if ( board.getBoard()[ cell ].getValue() ) return;
        board.addBoardMark( cell, activePlayer.token );

        // Check if last play has a winning combination
        // Activate win state on corresponding cells

        const winComb = winConditions( board.getBoard(), activePlayer.token );

        if ( winComb.getWinState() ) {
            activePlayer.wins += 1;
            let winCells = winComb.getWinCombination();
            for ( cell in winCells ) board.getBoard()[ winCells[ cell ] ].changeCellState();
            boardState = false;
        }

        switchPlayerTurn();
    };

    const getBoardState = () => boardState;

    const getAllPlayers = () => players;

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        resetBoard: board.resetBoard,
        getBoardState,
        getAllPlayers,
        switchPlayerTurn
    };
}

function ScreenController() {
    const game = GameController();
    const activePlayer = game.getActivePlayer();
    const playerTurnDiv = document.querySelector( '.player-display' );
    const boardContainer = document.querySelector( ".board-container" );
    const boardDiv = document.querySelector( '.board' );
    // const btnNewRound = document.createElement( "button" );
    const scoreBoard = document.querySelector( ".score-board" );
    // const playerChoiceDiv = document.querySelector( ".player-choice" );

    // Global screen changes on game startup
    // playerChoiceDiv.classList.add( "not-visible" );
    // btnNewRound.className = "game-ruler";
    // btnNewRound.textContent = "New round";
    boardContainer.className = "board-container playing-state";
    startGame.getBtnGame().textContent = "Restart Game";
    startGame.getBtnGame().removeEventListener( "click", ScreenController )
    startGame.getBtnGame().addEventListener( "click", ScreenController )


    const updateScreen = () => {
        const board = game.getBoard();
        const players = game.getAllPlayers();

        // Update boards on screen update
        updateScore( players[ 0 ].name, players[ 0 ].wins, players[ 1 ].name, players[ 1 ].wins );
        boardDiv.textContent = "";
        playerTurnDiv.textContent = `${ activePlayer.name }'s turn`

        // Render board squares
        board.forEach( ( cell, index ) => {
            const cellButton = document.createElement( "button" );
            cellButton.classList.add( "cell" );
            // Create a data attribute to identify the cell
            cellButton.dataset.cell = index;
            cellButton.textContent = cell.getValue();
            boardDiv.appendChild( cellButton );
        } );

        // Check if a cell has a winning state and changes its background color
        let winDisplayState = false;
        game.getBoard().forEach( ( cell, index ) => {
            if ( cell.getCellState() ) {
                const winCell = document.querySelector( `[data-cell="${ index }"]` )
                winCell.classList.add( "win-cells" );
                winDisplayState = true;
                relaunchGame();
            };
        } );

        // End round and launch next
        // if ( winDisplayState ) {
        // btnNewRound.addEventListener( "click", () => {
        //     if ( scoreBoard.lastElementChild.className == "game-ruler" ) scoreBoard.lastElementChild.remove();
        //     boardDiv.addEventListener( "click", clickHandlerBoard );
        // } );
        // scoreBoard.append( btnNewRound );
        // playerChoiceDiv.classList.remove( "not-visible" );
        // boardDiv.removeEventListener( "click", clickHandlerBoard );
        // };
    }

    async function relaunchGame() {
        boardDiv.removeEventListener( "click", clickHandlerBoard );
        await delay( 2000 )
        const cells = document.querySelectorAll( ".cell" );
        cells.forEach( ( cell ) => {
            cell.textContent = "";
            cell.classList.remove( "win-cells" );
        } );
        playerTurnDiv.textContent = `${ activePlayer.name }'s turn`;
        game.resetBoard();
        game.switchPlayerTurn();
        boardDiv.addEventListener( "click", clickHandlerBoard );
    }

    async function handleRelaunch() {
        let count = 0;
        game.getBoard().forEach( ( cell ) => {
            // console.log( cell.getValue() )
            if ( cell.getValue() === "" ) count += 1
        } );
        console.log( count )
        if ( count === 0 ) relaunchGame()
    }

    // Add event listener for the board
    function clickHandlerBoard( e ) {
        if ( scoreBoard.lastElementChild.className == "game-ruler" ) scoreBoard.lastElementChild.remove()
        const selectedCell = e.target.dataset.cell;
        if ( !selectedCell ) return;
        game.playRound( selectedCell );
        handleRelaunch();
        handleComputerRound( game.getBoard(), game );
        updateScreen();
    };

    boardDiv.addEventListener( "click", clickHandlerBoard )
    // ( game.getActivePlayer().token === "X" ) ? boardDiv.addEventListener( "click", clickHandlerBoard ) : handleComputerRound( game.getBoard(), game );

    updateScreen();

}

function winConditions( board, token ) {

    let possibleCombinations = [
        [ 0, 1, 2 ],
        [ 0, 4, 8 ],
        [ 0, 3, 6 ],
        [ 1, 4, 7 ],
        [ 2, 5, 8 ],
        [ 2, 4, 6 ],
        [ 3, 4, 5 ],
        [ 6, 7, 8 ]
    ]

    let winCombination = [];

    let winState = false;

    // Brute force check of winning combinations

    for ( comb of possibleCombinations ) {
        if ( ( board[ comb[ 0 ] ].getValue() == token ) && ( board[ comb[ 1 ] ].getValue() == token ) && ( board[ comb[ 2 ] ].getValue() == token ) ) {
            winCombination = [ comb[ 0 ], comb[ 1 ], comb[ 2 ] ];
            winState = true;
        }
    }

    const getWinState = () => winState;

    const getWinCombination = () => winCombination;

    return {
        getWinCombination,
        getWinState
    }
};

function updateScore( user1, text1, user2, text2 ) {
    const scoreDiv1 = document.querySelector( ".score1" );
    const scoreDiv2 = document.querySelector( ".score2" );
    const score1 = document.querySelector( ".score1 > p" );
    const score2 = document.querySelector( ".score2 > p" );
    const player1 = document.querySelector( ".score1 > h3" );
    const player2 = document.querySelector( ".score2 > h3" );
    if ( score1 === null ) {
        const score1 = document.createElement( "p" );
        const score2 = document.createElement( "p" );
        const player1 = document.createElement( "h3" );
        const player2 = document.createElement( "h3" );
        player1.textContent = user1;
        player2.textContent = user2;
        score1.textContent = text1;
        score2.textContent = text2;
        scoreDiv1.append( player1, score1 );
        scoreDiv2.append( player2, score2 );
    } else {
        player1.textContent = user1;
        player2.textContent = user2;
        score1.textContent = text1;
        score2.textContent = text2;
    }
};

function sleep( ms ) {
    let timeStart = new Date().getTime();
    while ( true ) {
        let elapsedTime = new Date().getTime() - timeStart;
        if ( elapsedTime > ms ) {
            break;
        }
    }
}

function wait( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) )
}

function handleComputerRound( board, game ) {
    const playerChoice = document.querySelector( 'input[name="players"]:checked' );
    let emptyCells = [];
    let stop;
    board.forEach( ( cell ) => {
        if ( cell.getCellState() ) return stop = true;
    } );
    if ( stop ) {
        console.log( "acrivates" )
        game.switchPlayerTurn();
        return;
    }
    if ( playerChoice.value === "2P" ) {
        board.forEach( ( cell, index ) => {
            console.log( cell.getValue() )
            if ( cell.getValue() === "" ) emptyCells.push( index );
        } );
        let rand = Math.floor( Math.random() * emptyCells.length );
        if ( emptyCells[ rand ] !== undefined ) game.playRound( emptyCells[ rand ] );
    }
}

const startGame = ( function () {
    const btnGame = document.querySelector( ".game-ruler" );

    btnGame.addEventListener( "click", ScreenController )

    const getBtnGame = () => btnGame;

    return {
        getBtnGame,
    }
} )();

const delay = ms => new Promise( res => setTimeout( res, ms ) );