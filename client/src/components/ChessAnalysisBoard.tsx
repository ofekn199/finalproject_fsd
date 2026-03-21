import { Chessboard } from "react-chessboard";

interface ChessAnalysisBoardProps {
  fen: string;
  bestMove?: string;
}

interface RuntimeChessboardProps {
  position: string;
  arePiecesDraggable?: boolean;
  boardWidth?: number;
  customSquareStyles?: Record<string, React.CSSProperties>;
  showBoardNotation?: boolean;
  animationDuration?: number;
}

const ChessboardRuntime =
  Chessboard as unknown as React.ComponentType<RuntimeChessboardProps>;

function getHighlightedSquares(bestMove?: string) {
  if (!bestMove || bestMove.length < 4) {
    return {};
  }

  const from = bestMove.slice(0, 2);
  const to = bestMove.slice(2, 4);

  return {
    [from]: {
      backgroundColor: "rgba(59, 130, 246, 0.35)",
      boxShadow: "inset 0 0 0 3px rgba(59, 130, 246, 0.95)",
    },
    [to]: {
      backgroundColor: "rgba(34, 197, 94, 0.35)",
      boxShadow: "inset 0 0 0 3px rgba(34, 197, 94, 0.95)",
    },
  };
}

export default function ChessAnalysisBoard({
  fen,
  bestMove,
}: ChessAnalysisBoardProps) {
  const customSquareStyles = getHighlightedSquares(bestMove);

  return (
    <div style={wrapperStyle}>
      <div style={boardShellStyle}>
        <ChessboardRuntime
          key={`${fen}-${bestMove ?? ""}`}
          position={fen}
          arePiecesDraggable={false}
          boardWidth={320}
          customSquareStyles={customSquareStyles}
          showBoardNotation
          animationDuration={200}
        />
      </div>

      {bestMove && (
        <div style={legendStyle}>
          <span style={legendItemStyle}>
            <span
              style={{
                ...legendDotStyle,
                background: "rgba(59, 130, 246, 0.8)",
              }}
            />
            From
          </span>

          <span style={legendItemStyle}>
            <span
              style={{
                ...legendDotStyle,
                background: "rgba(34, 197, 94, 0.8)",
              }}
            />
            To
          </span>
        </div>
      )}
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 320,
  marginTop: 12,
};

const boardShellStyle: React.CSSProperties = {
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
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