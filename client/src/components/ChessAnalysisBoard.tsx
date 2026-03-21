import { Chessboard } from "react-chessboard";

interface ChessAnalysisBoardProps {
  fen: string;
}

export default function ChessAnalysisBoard({
  fen,
}: ChessAnalysisBoardProps) {
  return (
    <div style={wrapperStyle}>
      <Chessboard
        options={{
          position: fen,
          arePiecesDraggable: false,
          boardWidth: 280,
        }}
      />
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 280,
  marginTop: 12,
  borderRadius: 12,
  overflow: "hidden",
};