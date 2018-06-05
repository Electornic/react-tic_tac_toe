import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  let highlightColor;
  if(props.highlight){
    highlightColor = {color: "blue"};
  }
  return (
    <button className="square" style={highlightColor} onClick={props.onClick}>
      {props.value}
    </button>
  );
  
}

class Board extends React.Component {
  renderSquare(i, row, col) {
    let won = false;
    if (this.props.winlog && this.props.winlog.indexOf(i) >= 0) {
      won = true;
    }

    return (
      <Square
        key={i}
        value={this.props.value[i]}
        highlight={won}
        onClick={() => this.props.onClick(i, row, col)}
      />
    );
  }
  render() {
    let squares = [];
    let num = 0;
    let row = [];

    for (let i = 0; i < 3; i++) {
      row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(num, i, j));
        num++;
      }
      squares.push(
        <div key={num} className="board-row">
          {row}
        </div>
      );
    }

    return <div>{squares}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      clicked: null,
      ascendingOrder: true //초기값 true로 준 이유가 나중에 정렬 뒤집는 버튼을 눌렀을 떄 false로 바꿔서 역정렬하기 때문에
    };
  }

  handleClick(i, row, col) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          clicked: [row, col]
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 ? false : true
    });
  }

  toggleOrder() {
    this.setState({
      ascendingOrder: !this.state.ascendingOrder
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    let winlog;

    const moves = history.map((step, move) => {
      let row = null;
      let col = null;
      if (move) {
        row = this.state.history[move].clicked[0];
        col = this.state.history[move].clicked[1];
      }
      const desc = move
        ? "Go to move #" + move + " (" + row + "," + col + ") "
        : "Go to game start";
      let bold = (move === this.state.stepNumber) ? "bold" : "";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} className={bold}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner && winner !== "Draw") {
      status = "Winner: " + winner.winner;
      winlog = winner.winnerLine;
    } else if (winner && winner === "Draw") {
      status = winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    if (!this.state.ascendingOrder) {
      moves.sort((a, b) => {
        return b.key - a.key;
      });
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            value={current.squares}
            winlog={winlog}
            onClick={(i, row, col) => this.handleClick(i, row, col)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.toggleOrder()}>Change order</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winnerLine: lines[i]
      };
    } else if (!squares.includes(null)) {
      return "Draw";
    }
  }
  return null;
}
