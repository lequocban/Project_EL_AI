import { useState, useEffect } from "react";
import base44 from "@/api/base44Client";
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  ListChecks,
  Keyboard,
  Headphones,
} from "lucide-react";
import FlashcardGame from "./FlashcardGame";
import MatchGame from "./MatchGame";
import MultipleChoiceGame from "./MultipleChoiceGame";
import TypingGame from "./TypingGame";
import DictationGame from "./DictationGame";

const MODES = [
  {
    id: "flashcard",
    label: "Flashcard",
    icon: Layers,
    color: "from-violet-500 to-indigo-500",
    emoji: "🃏",
  },
  {
    id: "match",
    label: "Nối từ",
    icon: ListChecks,
    color: "from-blue-500 to-cyan-500",
    emoji: "🔗",
  },
  {
    id: "quiz",
    label: "Trắc nghiệm",
    icon: BookOpen,
    color: "from-green-500 to-teal-500",
    emoji: "📝",
  },
  {
    id: "typing",
    label: "Gõ từ",
    icon: Keyboard,
    color: "from-orange-500 to-amber-500",
    emoji: "⌨️",
  },
  {
    id: "dictation",
    label: "Nghe viết",
    icon: Headphones,
    color: "from-pink-500 to-rose-500",
    emoji: "🎧",
  },
];

export default function SetDetail({ set, onBack }) {
  const [words, setWords] = useState([]);
  const [mode, setMode] = useState(null);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    meaning: "",
    pronunciation: "",
    example: "",
    part_of_speech: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWords();
  }, [set.id]);

  const loadWords = async () => {
    const ws = await base44.entities.VocabularyWord.filter(
      { set_id: set.id },
      "word",
      100,
    );
    setWords(ws);
  };

  const addWord = async () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;
    setLoading(true);
    const w = await base44.entities.VocabularyWord.create({
      ...newWord,
      set_id: set.id,
    });
    await base44.entities.VocabularySet.update(set.id, {
      word_count: words.length + 1,
    });
    setWords([...words, w]);
    setNewWord({
      word: "",
      meaning: "",
      pronunciation: "",
      example: "",
      part_of_speech: "",
    });
    setLoading(false);
    setShowAddWord(false);
  };

  const deleteWord = async (id) => {
    await base44.entities.VocabularyWord.delete(id);
    const updated = words.filter((w) => w.id !== id);
    setWords(updated);
    await base44.entities.VocabularySet.update(set.id, {
      word_count: updated.length,
    });
  };

  if (mode === "flashcard")
    return (
      <FlashcardGame words={words} set={set} onBack={() => setMode(null)} />
    );
  if (mode === "match")
    return <MatchGame words={words} set={set} onBack={() => setMode(null)} />;
  if (mode === "quiz")
    return (
      <MultipleChoiceGame
        words={words}
        set={set}
        onBack={() => setMode(null)}
      />
    );
  if (mode === "typing")
    return <TypingGame words={words} set={set} onBack={() => setMode(null)} />;
  if (mode === "dictation")
    return (
      <DictationGame words={words} set={set} onBack={() => setMode(null)} />
    );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">{set.title}</h1>
        {set.description && (
          <p className="text-muted-foreground text-sm mt-1">
            {set.description}
          </p>
        )}
        <p className="text-sm font-semibold text-primary mt-1">
          {words.length} từ vựng
        </p>
      </div>

      {/* Practice Modes */}
      {words.length >= 4 && (
        <div className="mb-8">
          <h2 className="text-base font-black text-foreground mb-3">
            Luyện tập
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`bg-gradient-to-br ${m.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md card-hover`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-bold text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {words.length < 4 && words.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
          ⚠️ Cần ít nhất 4 từ để bắt đầu luyện tập. Hãy thêm thêm từ vựng!
        </div>
      )}

      {/* Word List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-foreground">Danh sách từ</h2>
        <button
          onClick={() => setShowAddWord(true)}
          className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm từ
        </button>
      </div>

      {showAddWord && (
        <div className="bg-white border border-border rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={newWord.word}
              onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
              placeholder="Từ tiếng Anh *"
              className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={newWord.meaning}
              onChange={(e) =>
                setNewWord({ ...newWord, meaning: e.target.value })
              }
              placeholder="Nghĩa tiếng Việt *"
              className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={newWord.pronunciation}
              onChange={(e) =>
                setNewWord({ ...newWord, pronunciation: e.target.value })
              }
              placeholder="/phiên âm/"
              className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={newWord.part_of_speech}
              onChange={(e) =>
                setNewWord({ ...newWord, part_of_speech: e.target.value })
              }
              placeholder="Từ loại (n, v, adj...)"
              className="px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            value={newWord.example}
            onChange={(e) =>
              setNewWord({ ...newWord, example: e.target.value })
            }
            placeholder="Câu ví dụ..."
            className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddWord(false)}
              className="px-4 py-2 rounded-xl border border-border font-bold text-sm hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={addWord}
              disabled={loading}
              className="gradient-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang thêm..." : "Thêm từ"}
            </button>
          </div>
        </div>
      )}

      {words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground font-semibold">
            Chưa có từ nào. Hãy thêm từ đầu tiên!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {words.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-border p-4 flex items-start justify-between group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{w.word}</span>
                  {w.pronunciation && (
                    <span className="text-xs text-muted-foreground">
                      /{w.pronunciation}/
                    </span>
                  )}
                  {w.part_of_speech && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {w.part_of_speech}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {w.meaning}
                </p>
                {w.example && (
                  <p className="text-xs text-muted-foreground/70 mt-1 italic">
                    "{w.example}"
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteWord(w.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
