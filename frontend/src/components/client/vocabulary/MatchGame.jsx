import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchGame({ words, set, onBack }) {
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState(null); // { id, side }
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    const sample = shuffle(words).slice(0, 8);
    const leftItems = shuffle(
      sample.map((w) => ({ id: w.id, text: w.word, side: "left" })),
    );
    const rightItems = shuffle(
      sample.map((w) => ({ id: w.id, text: w.meaning, side: "right" })),
    );
    setPairs({ left: leftItems, right: rightItems });
  }, []);

  const handleSelect = (item) => {
    if (matched.includes(item.id)) return;
    if (!selected) {
      setSelected(item);
      return;
    }
    if (selected.side === item.side) {
      setSelected(item);
      return;
    }
    if (selected.id === item.id) {
      const newMatched = [...matched, item.id];
      setMatched(newMatched);
      setSelected(null);
      setWrong([]);
      if (newMatched.length === pairs.left?.length) setDone(true);
    } else {
      setWrong([selected.id + selected.side, item.id + item.side]);
      setErrors((e) => e + 1);
      setTimeout(() => {
        setWrong([]);
        setSelected(null);
      }, 800);
    }
  };

  const isSelected = (item) =>
    selected?.id === item.id && selected?.side === item.side;
  const isWrong = (item) => wrong.includes(item.id + item.side);

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-black mb-2">Hoàn thành!</h2>
          <p className="text-muted-foreground font-medium mb-2">
            Bạn nối đúng {pairs.left?.length} cặp
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Số lần sai: <span className="text-red-500 font-bold">{errors}</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 border border-border rounded-xl py-2.5 font-bold text-sm hover:bg-muted"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Thoát
      </button>
      <h1 className="text-xl font-black mb-2">🔗 Nối từ với nghĩa</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Chọn một từ ở cột trái và nghĩa tương ứng ở cột phải
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        <div className="space-y-2">
          {pairs.left?.map((item) => (
            <button
              key={item.id + "l"}
              onClick={() => handleSelect(item)}
              className={`w-full p-3 rounded-xl border-2 font-bold text-sm text-left transition-all ${
                matched.includes(item.id)
                  ? "bg-green-100 border-green-400 text-green-700 line-through opacity-50"
                  : isWrong(item)
                    ? "bg-red-100 border-red-400 text-red-700"
                    : isSelected(item)
                      ? "gradient-primary text-white border-transparent shadow-md scale-105"
                      : "bg-white border-border hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {pairs.right?.map((item) => (
            <button
              key={item.id + "r"}
              onClick={() => handleSelect(item)}
              className={`w-full p-3 rounded-xl border-2 font-bold text-sm text-left transition-all ${
                matched.includes(item.id)
                  ? "bg-green-100 border-green-400 text-green-700 line-through opacity-50"
                  : isWrong(item)
                    ? "bg-red-100 border-red-400 text-red-700"
                    : isSelected(item)
                      ? "bg-blue-500 text-white border-transparent shadow-md scale-105"
                      : "bg-white border-border hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Đã nối: {matched.length}/{pairs.left?.length}
      </p>
    </div>
  );
}
