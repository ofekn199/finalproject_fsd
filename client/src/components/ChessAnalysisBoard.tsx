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

const BOARD_SIZE = 320;
const SQUARE_SIZE = BOARD_SIZE / 8;

function getHighlightedSquares(bestMove?: string) {
  if (!bestMove || bestMove.length < 4) {
    return {};
  }

  const from = bestMove.slice(0, 2);
  const to = bestMove.slice(2, 4);

  return {
    [from]: {
      backgroundColor: "rgba(132, 204, 22, 0.22)",
    },
    [to]: {
      backgroundColor: "rgba(132, 204, 22, 0.28)",
    },
  };
}

function squareToPoint(square?: string) {
  if (!square || square.length !== 2) return null;

  const file = square[0];
  const rank = Number(square[1]);

  const col = file.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - rank;

  if (col < 0 || col > 7 || Number.isNaN(row) || row < 0 || row > 7) {
    return null;
  }

  return {
    x: col * SQUARE_SIZE + SQUARE_SIZE / 2,
    y: row * SQUARE_SIZE + SQUARE_SIZE / 2,
  };
}

function parseSquare(square?: string) {
  if (!square || square.length !== 2) return null;

  const file = square[0].charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]);

  if (file < 0 || file > 7 || Number.isNaN(rank) || rank < 1 || rank > 8) {
    return null;
  }

  return { file, rank };
}

function coordsToSquare(file: number, rank: number) {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return undefined;
  return `${String.fromCharCode("a".charCodeAt(0) + file)}${rank}`;
}

function getMoveSquares(bestMove?: string) {
  if (!bestMove || bestMove.length < 4) {
    return { from: undefined, to: undefined };
  }

  return {
    from: bestMove.slice(0, 2),
    to: bestMove.slice(2, 4),
  };
}

function getKnightCornerSquare(from?: string, to?: string) {
  const fromParsed = parseSquare(from);
  const toParsed = parseSquare(to);

  if (!fromParsed || !toParsed) return undefined;

  const fileDiff = toParsed.file - fromParsed.file;
  const rankDiff = toParsed.rank - fromParsed.rank;

  const absFileDiff = Math.abs(fileDiff);
  const absRankDiff = Math.abs(rankDiff);

  const isKnightMove =
    (absFileDiff === 1 && absRankDiff === 2) ||
    (absFileDiff === 2 && absRankDiff === 1);

  if (!isKnightMove) return undefined;

  // If the long leg is vertical, go vertical first then horizontal.
  if (absRankDiff === 2) {
    return coordsToSquare(fromParsed.file, toParsed.rank);
  }

  // If the long leg is horizontal, go horizontal first then vertical.
  return coordsToSquare(toParsed.file, fromParsed.rank);
}

export default function ChessAnalysisBoard({
  fen,
  bestMove,
}: ChessAnalysisBoardProps) {
  const customSquareStyles = getHighlightedSquares(bestMove);
  const { from, to } = getMoveSquares(bestMove);

  const fromPoint = squareToPoint(from);
  const toPoint = squareToPoint(to);

  const knightCornerSquare = getKnightCornerSquare(from, to);
  const cornerPoint = squareToPoint(knightCornerSquare);

  const isKnightPath = !!cornerPoint && !!fromPoint && !!toPoint;

  return (
    <div style={wrapperStyle}>
      <div style={boardShellStyle}>
        <div style={boardLayerStyle}>
          <ChessboardRuntime
            key={`${fen}-${bestMove ?? ""}`}
            position={fen}
            arePiecesDraggable={false}
            boardWidth={BOARD_SIZE}
            customSquareStyles={customSquareStyles}
            showBoardNotation
            animationDuration={200}
          />
        </div>

        {(fromPoint && toPoint) && (
          <svg
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
            style={arrowLayerStyle}
          >
            <defs>
              <marker
                id="engine-arrowhead"
                markerWidth="26"
                markerHeight="26"
                refX="18"
                refY="13"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M0,0 L26,13 L0,26 L7,13 z"
                  fill="rgba(132, 204, 22, 0.58)"
                />
              </marker>
            </defs>

            {isKnightPath && cornerPoint ? (
              <path
                d={`M ${fromPoint.x} ${fromPoint.y} L ${cornerPoint.x} ${cornerPoint.y} L ${toPoint.x} ${toPoint.y}`}
                fill="none"
                stroke="rgba(132, 204, 22, 0.42)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#engine-arrowhead)"
              />
            ) : (
              <line
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke="rgba(132, 204, 22, 0.42)"
                strokeWidth="10"
                strokeLinecap="round"
                markerEnd="url(#engine-arrowhead)"
              />
            )}
          </svg>
        )}
      </div>

      {bestMove && (
        <div style={legendStyle}>
          <span style={legendItemStyle}>
            <span style={legendArrowStyle} />
            Best move
          </span>
        </div>
      )}
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: BOARD_SIZE,
  marginTop: 12,
};

const boardShellStyle: React.CSSProperties = {
  position: "relative",
  width: BOARD_SIZE,
  height: BOARD_SIZE,
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
};

const boardLayerStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};

const arrowLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 3,
  pointerEvents: "none",
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 8,
  fontSize: 12,
  color: "var(--muted)",
  flexWrap: "wrap",
};

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const legendArrowStyle: React.CSSProperties = {
  width: 18,
  height: 8,
  borderRadius: 999,
  background: "rgba(132, 204, 22, 0.5)",
  display: "inline-block",
};