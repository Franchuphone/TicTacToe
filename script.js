function Gameboard() {

    const board = [];

    for ( let i = 0; i < 9; i++ ) {
        board.push( Cell() );
    }


    const getBoard = () => board;

    const addBoardMark = ( cell, player ) => {
        board[ cell ].addMark( player );
    };

    const printBoard = () => {
        const boardWithCellValues = board.map( ( cell ) => cell.getValue() )
        console.log( boardWithCellValues );
    };

    return { getBoard, addBoardMark, printBoard };
}

function Cell() {
    let value;
    let background = 0;

    const addMark = ( playerMark ) => {
        value = playerMark;
    };

    const winBackground = () => background = 1;

    const getValue = () => value;

    const getBackground = () => background;

    return {
        addMark,
        getValue,
        winBackground,
        getBackground
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: "X",
            wins: 0
        },
        {
            name: playerTwoName,
            token: "O",
            wins: 0
        }
    ];

    let boardState = true;

    let activePlayer = players[ 0 ];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[ 0 ] ? players[ 1 ] : players[ 0 ];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log( `${ getActivePlayer().name }'s turn.` );
    };

    const playRound = ( cell ) => {
        if ( board.getBoard()[ cell ].getValue() ) return;
        console.log( `${ getActivePlayer().name } has just played` );
        board.addBoardMark( cell, activePlayer.token );

        // Check if last play has a winning combination

        const winComb = winConditions( board.getBoard(), activePlayer.token );

        if ( winComb.getWinState() ) {
            activePlayer.wins += 1;
            let winCells = winComb.getWinCombination();
            for ( cell in winCells ) board.getBoard()[ winCells[ cell ] ].winBackground();
            boardState = false;
        }

        switchPlayerTurn();
        printNewRound();
    };

    const getBoardState = () => boardState;

    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        getBoardState
    };
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

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector( '.turn' );
    const boardDiv = document.querySelector( '.board' );

    const getDiv = () => playerTurnDiv;

    const updateScreen = () => {

        boardDiv.textContent = "";

        const board = game.getBoard();

        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `${ activePlayer.name }'s turn`

        // Render board squares
        board.forEach( ( cell, index ) => {
            const cellButton = document.createElement( "button" );
            cellButton.classList.add( "cell" );
            // Create a data attribute to identify the cell
            cellButton.dataset.cell = index;
            cellButton.textContent = cell.getValue();
            if ( cell.getBackground() === 1 ) {
                cellButton.style.background = "rgb(219, 126, 100)";
                boardDiv.removeEventListener( "click", clickHandlerBoard );
            }
            boardDiv.appendChild( cellButton );

        } );
    }

    // Add event listener for the board
    function clickHandlerBoard( e ) {
        const selectedCell = e.target.dataset.cell;
        // Make sure I've clicked a column and not the gaps in between
        if ( !selectedCell ) return;

        game.playRound( selectedCell );
        updateScreen();
    };

    boardDiv.addEventListener( "click", clickHandlerBoard );

    updateScreen();

    return {
        clickHandlerBoard,
        getDiv
    }
}

ScreenController();