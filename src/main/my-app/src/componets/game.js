import React, { Component } from "react";
import "../stratego.css";
import LeftPane from "./leftPane";
import Board from "./board";
import FallenPieces from "./fallenPieces";
import boardInitialization from "./board-Initialization";

export default class Game extends Component {
    constructor() {
        super();
        this.state = {
            squares: boardInitialization(),   // initialized with 100 squares, but only pieces are places.
                                              // Square style has not set yet.
            player1FallenPieces: [],          // used to store player1 defeated pieces
            player2FallenPieces: [],          // used to store player2 defeated pieces
            player: 1,                        // tells which player's turn
            info: "",                         // shows warning or instruction
            selectedObj: -1,                  // remains less than 0 when no piece is selected.
                                              // stores the selected piece index

            // Flag rank: 0 ; Bomb rank: 11; Total 12 pieces
            player1Pieces: [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1, 6],  //Record the number of each piece of player1 on the board;
                                                                  // Pieces are sorted by ranks
            player2Pieces: [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1, 6],  //Record the number of each piece of player2 on the board;
                                                                  // Pieces are sorted by ranks
        };
    }
    /*
     * Move pieces on the board and change a piece
     * shade style when it is clicked
     *
     * @param { number } dest - index of clicked square on the board
     *
     */
    handleClick(dest) {
        const squares = this.state.squares.slice()
        const src = this.state.selectedObj
        //No piece has been selected
        if (src < 0) {
            //Select empty square or wrong team piece
            if (!squares[dest] || squares[dest].player !== this.state.player) {
                this.setState({
                    info:
                        "Wrong Selection. Please choose player" +
                        this.state.player +
                        " pieces."
                });
                if (squares[dest]) {
                    squares[dest].style = { ...squares[dest].style, backgroundColor: "" }
                }

                //Select correct team piece
            } else {
                //Change background shade
                squares[dest].style = {
                    ...squares[dest].style,
                    backgroundColor: "RGB(111,143,114)"
                }
                this.setState({
                    info: "Choose destination for the selected piece",
                    selectedObj: dest
                })
            }

            //If one piece is selected, check the destination
        } else {
            //Remove source piece background shade
            squares[src].style = {
                ...squares[src].style,
                backgroundColor: ""
            };
            //If the piece in the destination is in the same team, unselect the source piece
            if (squares[dest] && squares[dest].player === this.state.player) {
                this.setState({
                    info: "Wrong selection. Choose valid source and destination again.",
                    selectedObj: -1
                })
                //There is no piece in the destination,
                //or there is a piece which is in different team from the source piece
            } else {
                const player1FallenPieces = this.state.player1FallenPieces.slice()
                const player2FallenPieces = this.state.player2FallenPieces.slice()
                const isMovable = this.isMovable(src, dest)

                if (isMovable) {
                    let rank1, //The player1's piece rank
                        rank2 //The player2's piece rank

                    //Two pieces fight
                    if (squares[dest] !== null) {
                        const fight = this.fight(src, dest)
                        //fight: -1 - the source piece lose
                        //       0 - tie
                        //       1 - the source piece win
                        if (squares[dest].player === 1) {
                            if (fight === -1) {
                                squares[src].style = {
                                    ...squares[src].style,
                                    height: '50px', width: '50px'
                                }
                                player2FallenPieces.push(squares[src])                      //Push the defeated piece to fallen pieces array
                                this.pieceAmountDecrement(2, squares[src].rank)      //The amount of the defeated piece decrease by one
                                squares[src] = null                                         //Remove the defeated piece from the board
                            }else if (fight === 0) {
                                squares[src].style = {
                                    ...squares[src].style,
                                    height: '50px', width: '50px'
                                }
                                squares[dest].style = {
                                    ...squares[dest].style,
                                    height: '50px', width: '50px'
                                }
                                player1FallenPieces.push(squares[dest])
                                player2FallenPieces.push(squares[src])
                                this.pieceAmountDecrement(1, squares[dest].rank)
                                this.pieceAmountDecrement(2, squares[src].rank)
                                squares[src] = null
                                squares[dest] = null
                            }else {
                                player1FallenPieces.push(squares[dest])
                                this.pieceAmountDecrement(1, squares[dest].rank)
                                squares[dest] = squares[src]
                                squares[src] = null
                            }
                        }else {
                            if (fight === -1) {
                                squares[src].style = {
                                    ...squares[src].style,
                                    height: '50px', width: '50px'
                                };
                                player1FallenPieces.push(squares[src])
                                this.pieceAmountDecrement(1, squares[src].rank)
                                squares[src] = null

                            }else if (fight === 0) {
                                squares[src].style = {
                                    ...squares[src].style,
                                    height: '50px', width: '50px'
                                };
                                squares[dest].style = {
                                    ...squares[dest].style,
                                    height: '50px', width: '50px'
                                };
                                player1FallenPieces.push(squares[src])
                                player2FallenPieces.push(squares[dest])
                                this.pieceAmountDecrement(1, squares[src].rank)
                                this.pieceAmountDecrement(2, squares[dest].rank)
                                squares[src] = null
                                squares[dest] = null

                            }else {
                                squares[dest].style = {
                                    ...squares[dest].style,
                                    height: '50px', width: '50px'
                                }
                                player2FallenPieces.push(squares[dest])
                                this.pieceAmountDecrement(2, squares[dest].rank)
                                squares[dest] = squares[src]
                                squares[src] = null
                            }
                        }
                    }else {
                        squares[dest] = squares[src]
                        squares[src] = null
                    }
                    let player = this.state.player === 1 ? 2 : 1
                    this.setState({
                        selectedObj: -1,
                        squares: squares,
                        player1FallenPieces: player1FallenPieces,
                        player2FallenPieces: player2FallenPieces,
                        player: player,
                        info: ""
                    })

                } else {
                    this.setState({
                        info: "Wrong selection. Choose valid source and destination again.",
                        selectedObj: -1
                    })
                }
            }
        }
    }

    /*
     * Return true if a piece can be move from source to destination
     *
     * @param { number } src - The source index
     * @param { number } dest - The destination index
     * @param { boolean } if the source piece can be moved to the destination
     */
    isMovable(src, dest) {
        const squares = this.state.squares.slice()
        const srcRank = squares[src].rank
        //Bomb and Flag can't move
        if (srcRank === 0 || srcRank === 11) {
            return false
        }
        //If dest is lake square, return false
        if (
            dest === 42 ||
            dest === 43 ||
            dest === 52 ||
            dest === 53 ||
            dest === 46 ||
            dest === 47 ||
            dest === 56 ||
            dest === 57
        ) {
            return false
        }
        //Scount can move unlimited steps
        if (srcRank === 2) {
            const mod = src % 10
            const diff = 10 - mod
            //If move backward, return false
            if (squares[src].player === 1 && dest - src > diff) {
                return false
            } else if (squares[src].player === 2 && src - dest > mod) {
                return false
            }
            let isMov =
                Math.abs(src - dest) % 10 === 0 ||
                (dest >= src - mod && dest < src + diff)
            let isValidPath = this.isValidPath(src, dest)
            return isMov && isValidPath
        }
        //The rest of the pieces can only move one step
        if (squares[src].player === 1) {
            return (
                src - 10 === dest || //move forward
                src + 1 === dest || //move right
                src - 1 === dest
            ) //move left
        } else {
            return (
                src + 10 === dest || //move forward
                src + 1 === dest || //move right
                src - 1 === dest //move left
            )
        }
    }
    /*
     * This is a helper function. It is used to
     * check if there is any object or lack square
     * between the source square and the destination
     * squares.
     *
     * @param { number } src - source index on the board
     * @param { number } dest - destination index on the board
     * @return { boolean } Return true if there is no piece
     *                     or lake squares between src and dest.
     *                     Otherwise, return false.
     */
    isValidPath(src, dest) {
        let path = [],
            pathStart,
            pathEnd,
            incrementBy
        if (src > dest) {
            pathStart = dest
            pathEnd = src
        } else {
            pathStart = src
            pathEnd = dest
        }
        if (Math.abs(src - dest) % 10 === 0) {
            incrementBy = 10
            pathStart += 10
        } else {
            incrementBy = 1
            pathStart += 1
        }

        for (let i = pathStart; i < pathEnd; i += incrementBy) {
            path.push(i)
        }

        let isValid = true
        for (let i = 0; i < path.length; i++) {
            if (
                this.state.squares[path[i]] !== null ||
                i === 42 ||
                i === 43 ||
                i === 52 ||
                i === 53 ||
                i === 46 ||
                i === 47 ||
                i === 56 ||
                i === 57
            ) {
                isValid = false
            }
        }
        return isValid
    }
    /*
     * This is helper function. It returns a digit which tells
     * if the source piece defeat the destination piece.
     *
     * @param { number } src - The index of source square
     * @param { number } dest - The index of clicked square
     * @return { number }  -1 - the source piece lose
     *                      0 - tie
     *                      1 - the source piece win
     */
    fight(src, dest) {
        const srcRank = this.state.squares[src].rank
        const destRank = this.state.squares[dest].rank
        if (srcRank === 3 && destRank === 11) {
            return 1
        }else if (srcRank === 1 && destRank === 10) {
            return 1
        }else if (srcRank > destRank) {
            return 1
        }else if (srcRank === destRank) {
            return 0
        }
        return -1


    }

    pieceAmountDecrement(player, index){
        console.log(index)
        let amounts;
        amounts = player === 1? this.state.player1Pieces.slice() : this.state.player2Pieces.slice()
        console.log(amounts)
        amounts[index] -= 1
        console.log(amounts[index])
        if (player === 1) {
            this.setState({ player1Pieces: amounts })
        }else {
            this.setState({ player2Pieces: amounts })
        }

    }
    render() {
        return (
            <div className="container">
                <LeftPane className="leftPane" player1Pieces={this.state.player1Pieces}
                          player2Pieces={this.state.player2Pieces}/>
                <div>
                    <h2 className="title">Stratego</h2>
                    <Board
                        squares={this.state.squares}
                        onClick={(index, e) => this.handleClick(index)}
                    />
                </div>
                <div>
                    <div className="game-info">
                        <h3>Turn</h3>
                        <div className="player-turn-box" style={{backgroundColor: this.state.player === 1? 'red' : 'blue'}}/>

                        <div className="game-info">{this.state.info}</div>

                        <div className="fallen-soldier-block">

                            {<FallenPieces className="fallenPieces"
                                           player1FallenPieces = {this.state.player1FallenPieces}
                                           player2FallenPieces = {this.state.player2FallenPieces}
                            />}
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}