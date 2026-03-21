import { Chess } from "chess.js";
import { spawn } from "child_process";

export interface AnalyzeChessInput {
  fen: string;
}

export interface AnalyzeChessResult {
  bestMove: string;
  evaluation: string;
  line: string[];
}

/**
 * Analyze a chess position using a local Stockfish binary.
 * Make sure Stockfish is installed on the machine and available in PATH.
 */
export async function analyzeChessPosition(
  input: AnalyzeChessInput
): Promise<AnalyzeChessResult> {
  const chess = new Chess();

  try {
    chess.load(input.fen);
  } catch {
    throw new Error("Invalid FEN");
  }

  return new Promise((resolve, reject) => {
    const engine = spawn("stockfish");

    let bestMove = "";
    let evaluation = "Unknown";
    let pv: string[] = [];
    let finished = false;

    const cleanupAndResolve = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);
      engine.kill();
      resolve({
        bestMove,
        evaluation,
        line: pv,
      });
    };

    const cleanupAndReject = (err: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);
      engine.kill();
      reject(err);
    };

    engine.stdout.on("data", (data: Buffer) => {
      const text = data.toString();
      const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

      for (const line of lines) {
        if (line.includes(" score cp ")) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            const cp = Number(match[1]);
            evaluation =
              cp > 0
                ? `White is better (${(cp / 100).toFixed(2)})`
                : cp < 0
                  ? `Black is better (${(Math.abs(cp) / 100).toFixed(2)})`
                  : "Equal position";
          }
        }

        if (line.includes(" score mate ")) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            const mate = Number(match[1]);
            evaluation =
              mate > 0
                ? `Mate for White in ${mate}`
                : `Mate for Black in ${Math.abs(mate)}`;
          }
        }

        if (line.startsWith("info") && line.includes(" pv ")) {
          const pvMatch = line.match(/ pv (.+)$/);
          if (pvMatch) {
            pv = pvMatch[1].trim().split(" ");
          }
        }

        if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          bestMove = parts[1] ?? "";
          cleanupAndResolve();
          return;
        }
      }
    });

    engine.stderr.on("data", (data: Buffer) => {
      const text = data.toString().trim();
      if (text) {
        cleanupAndReject(new Error(text));
      }
    });

    engine.on("error", (err) => {
      cleanupAndReject(
        new Error(`Failed to start Stockfish process: ${err.message}`)
      );
    });

    const timeoutId = setTimeout(() => {
      cleanupAndReject(new Error("Stockfish analysis timeout"));
    }, 10000);

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");
    engine.stdin.write(`position fen ${input.fen}\n`);
    engine.stdin.write("go depth 12\n");
  });
}