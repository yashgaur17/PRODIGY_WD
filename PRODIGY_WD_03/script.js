const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");

let currentPlayer = "X";
let squares = Array(9).fill("");
let gameActive = true;

// Render the board
function renderBoard() {
  board.innerHTML = "";
  squares.forEach((value, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (value) cell.classList.add("taken");
    cell.textContent = value;
    cell.addEventListener("click", () => handleClick(index));
    board.appendChild(cell);
  });
}

// Handle a cell click
function handleClick(i) {
  if (!gameActive || squares[i] !== "") return;

  squares[i] = currentPlayer;

  if (checkWin(squares, currentPlayer)) {
    statusText.textContent = `🎉 Player ${currentPlayer} wins!`;
    gameActive = false;
  } else if (squares.every(cell => cell !== "")) {
    statusText.textContent = "🤝 It's a draw!";
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }

  renderBoard();
}

// Check for a win
function checkWin(boardState, player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => boardState[index] === player)
  );
}

// Reset the game
resetBtn.addEventListener("click", () => {
  squares.fill("");
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X's turn";
  renderBoard();
});

// Initial render
renderBoard();