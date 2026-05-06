import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

export default function FlashcardGame({ words, set, onBack }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [done, setDone] = useState(false);

  const current = words[index];
  const total = words.length;

  const handleKnow = (knew) => {
    if (knew) setKnown([...known, current.id]);
    else setUnknown([...unknown, current.id]);
    setFlipped(false);
    if (index + 1 >= total) setDone(true);
    else setIndex(index + 1);
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
    setDone(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-black mb-2">Xong rồi!</h2>
          <p className="text-muted-foreground font-medium mb-6">
            Bạn đã xem qua {total} từ
          </p>
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-500">
                {known.length}
              </div>
              <div className="text-sm text-muted-foreground">Đã biết</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-500">
                {unknown.length}
              </div>
              <div className="text-sm text-muted-foreground">Cần ôn</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 border border-border rounded-xl py-2.5 font-bold text-sm hover:bg-muted"
            >
              Quay lại
            </button>
            <button
              onClick={restart}
              className="flex-1 gradient-primary text-white rounded-xl py-2.5 font-bold text-sm shadow-md"
            >
              Học lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát
        </button>
        <span className="text-sm font-bold text-muted-foreground">
          {index + 1} / {total}
        </span>
        <button onClick={restart} className="p-2 hover:bg-muted rounded-xl">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-muted rounded-full mb-8 overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex justify-center mb-8">
        <div
          onClick={() => setFlipped(!flipped)}
          className="w-full max-w-md h-56 cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <div
            className={`relative w-full h-full transition-all duration-500`}
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white border-2 border-border rounded-3xl flex flex-col items-center justify-center p-8 shadow-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-xs text-muted-foreground font-semibold mb-3 uppercase tracking-wide">
                Từ tiếng Anh
              </p>
              <h2 className="text-3xl font-black text-foreground text-center">
                {current?.word}
              </h2>
              {current?.pronunciation && (
                <p className="text-muted-foreground mt-2">
                  /{current.pronunciation}/
                </p>
              )}
              {current?.part_of_speech && (
                <span className="mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                  {current.part_of_speech}
                </span>
              )}
              <p className="text-xs text-muted-foreground/50 mt-6">
                Nhấn để lật thẻ
              </p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 gradient-primary rounded-3xl flex flex-col items-center justify-center p-8 shadow-xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-xs text-white/70 font-semibold mb-3 uppercase tracking-wide">
                Nghĩa tiếng Việt
              </p>
              <h2 className="text-2xl font-black text-white text-center">
                {current?.meaning}
              </h2>
              {current?.example && (
                <p className="text-white/80 text-sm mt-4 text-center italic">
                  "{current.example}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleKnow(false)}
          className="flex items-center gap-2 bg-red-100 text-red-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-red-200 transition-all shadow-md"
        >
          <X className="w-5 h-5" /> Chưa biết
        </button>
        <button
          onClick={() => handleKnow(true)}
          className="flex items-center gap-2 bg-green-100 text-green-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-green-200 transition-all shadow-md"
        >
          <Check className="w-5 h-5" /> Đã biết
        </button>
      </div>
    </div>
  );
}
