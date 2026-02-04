function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for ( let i = 0; i < rows; i++ ) {
        board[ i ] = [];
        for ( let j = 0; j < columns; j++ ) {
            board[ i ].push( Cell() );
        }
    }

    const getBoard = () => board;

    const addBoardMark = ( cell, player ) => {
        if ( cell.getValue() ) return;
        cell.addMark( player );
    };

    const printBoard = () => {
        const boardWithCellValues = board.map( ( row ) => row.map( ( cell ) => cell.getValue() ) )
        console.log( boardWithCellValues );
    };

    return { getBoard, addBoardMark, printBoard };
}

function Cell() {
    let value;

    const addMark = ( playerMark ) => {
        value = playerMark;
    };

    const getValue = () => value;

    return {
        addMark,
        getValue
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
            token: "X"
        },
        {
            name: playerTwoName,
            token: "O"
        }
    ];

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
        console.log( `${ getActivePlayer().name } has just played` );
        board.addBoardMark( cell, getActivePlayer().token );

        /*  This is where we would check for a winner and handle that logic,
            such as a win message. */

        switchPlayerTurn();
        printNewRound();
    };

    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector( '.turn' );
    const boardDiv = document.querySelector( '.board' );

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";

        // get the newest version of the board and player turn
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display player's turn
        playerTurnDiv.textContent = `${ activePlayer.name }'s turn...`

        // Render board squares
        board.forEach( row => {
            row.forEach( ( cell, index ) => {
                // Anything clickable should be a button!!
                const cellButton = document.createElement( "button" );
                cellButton.classList.add( "cell" );
                // Create a data attribute to identify the column
                // This makes it easier to pass into our `playRound` function 
                cellButton.dataset.column = index
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild( cellButton );
            } )
        } )
    }

    // Add event listener for the board
    function clickHandlerBoard( e ) {
        const selectedColumn = e.target.dataset.column;
        // Make sure I've clicked a column and not the gaps in between
        if ( !selectedColumn ) return;

        game.playRound( selectedColumn );
        updateScreen();
    }
    boardDiv.addEventListener( "click", clickHandlerBoard );

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}

ScreenController();