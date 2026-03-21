import { Chessboard } from "react-chessboard";

interface ChessAnalysisBoardProps {
  fen: string;
  bestMove?: string;
}

function squareToCoords(square: string) {
  if (square.length !== 2) return null;

  const file = square[0];
  const rank = square[1];

  const col = file.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - Number(rank);

  if (col < 0 || col > 7 || Number.isNaN(row) || row < 0 || row > 7) {
    return null;
  }

  return { row, col };
}

function getMoveSquares(bestMove?: string) {
  if (!bestMove || bestMove.length < 4) {
    return { from: null, to: null };
  }

  const from = squareToCoords(bestMove.slice(0, 2));
  const to = squareToCoords(bestMove.slice(2, 4));

  return { from, to };
}

export default function ChessAnalysisBoard({
  fen,
  bestMove,
}: ChessAnalysisBoardProps) {
  const { from, to } = getMoveSquares(bestMove);

  return (
    <div style={wrapperStyle}>
      <div style={boardContainerStyle}>
        <Chessboard
          options={{
            position: fen,
            arePiecesDraggable: false,
            boardWidth: 280,
          }}
        />

        {from && (
          <div
            style={{
              ...highlightStyle,
              ...getSquareOverlayStyle(from.row, from.col),
              background: "rgba(59, 130, 246, 0.35)",
              border: "2px solid rgba(59, 130, 246, 0.85)",
            }}
            title="Best move: from"
          />
        )}

        {to && (
          <div
            style={{
              ...highlightStyle,
              ...getSquareOverlayStyle(to.row, to.col),
              background: "rgba(34, 197, 94, 0.35)",
              border: "2px solid rgba(34, 197, 94, 0.85)",
            }}
            title="Best move: to"
          />
        )}
      </div>

      {bestMove && (
        <div style={legendStyle}>
          <span style={legendItemStyle}>
            <span
              style={{
                ...legendDotStyle,
                background: "rgba(59, 130, 246, 0.75)",
              }}
            />
            From
          </span>

          <span style={legendItemStyle}>
            <span
              style={{
                ...legendDotStyle,
                background: "rgba(34, 197, 94, 0.75)",
              }}
            />
            To
          </span>
        </div>
      )}
    </div>
  );
}

function getSquareOverlayStyle(row: number, col: number): React.CSSProperties {
  const size = 100 / 8;

  return {
    top: `${row * size}%`,
    left: `${col * size}%`,
    width: `${size}%`,
    height: `${size}%`,
  };
}

const wrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 280,
  marginTop: 12,
};

const boardContainerStyle: React.CSSProperties = {
  position: "relative",
  width: 280,
  height: 280,
  borderRadius: 12,
  overflow: "hidden",
};

const highlightStyle: React.CSSProperties = {
  position: "absolute",
  boxSizing: "border-box",
  pointerEvents: "none",
  zIndex: 5,
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 8,
  fontSize: 12,
  color: "var(--muted)",
};

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const legendDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  display: "inline-block",
};