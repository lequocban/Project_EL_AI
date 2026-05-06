import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Globe,
  Lock,
  Trash2,
  ChevronRight,
} from "lucide-react";
import CreateSetModal from "../components/vocabulary/CreateSetModal";
import SetDetail from "../components/vocabulary/SetDetail";
import { vocabularyApi } from "@/api/vocabularyApi";

const LEVEL_LABELS = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};
const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};
const SET_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
];

export default function Vocabulary() {
  const [sets, setSets] = useState([]);
  const [publicSets, setPublicSets] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("mine");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mine, pub] = await Promise.all([
        vocabularyApi.getMySets(),
        vocabularyApi.getPublicSets(),
      ]);
      setSets(mine);
      setPublicSets(pub);
      setError("");
    } catch (err) {
      setSets([]);
      setPublicSets([]);
      setError(err.message || "Không thể tải dữ liệu từ vựng");
    }
  };

  const deleteSet = async (id, e) => {
    e.stopPropagation();
    try {
      await vocabularyApi.deleteSet(id);
      setSets((current) => current.filter((s) => s.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Không thể xóa bộ từ");
    }
  };

  const displayed = (tab === "mine" ? sets : publicSets).filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (selectedSet) {
    return (
      <SetDetail
        set={selectedSet}
        onBack={() => {
          setSelectedSet(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">📚 Từ vựng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý và học bộ từ vựng của bạn
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 gradient-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo bộ từ
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {[
          ["mine", "Của tôi"],
          ["public", "Cộng đồng"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === val
                ? "gradient-primary text-white shadow-md"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm bộ từ vựng..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">Chưa có dữ liệu</p>
          {tab === "mine" && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 gradient-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90"
            >
              Tạo bộ từ đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((set, i) => (
            <div
              key={set.id}
              onClick={() => setSelectedSet(set)}
              className="bg-white rounded-2xl p-5 border border-border card-hover cursor-pointer group relative"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${SET_COLORS[i % SET_COLORS.length]} rounded-xl flex items-center justify-center mb-3 shadow-md`}
              >
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex-1 pr-2">
                  {set.title}
                </h3>
                <div className="flex items-center gap-1">
                  {set.is_ai_generated && <Sparkles className="w-4 h-4 text-violet-400" />}
                  {set.is_public ? (
                    <Globe className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                  )}
                  {tab === "mine" && (
                    <button
                      onClick={(e) => deleteSet(set.id, e)}
                      className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {set.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {set.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {set.word_count || 0} từ
                </span>
                {set.level && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[set.level]}`}
                  >
                    {LEVEL_LABELS[set.level]}
                  </span>
                )}
              </div>
              <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSetModal
          onClose={() => setShowCreate(false)}
          onCreated={(s) => {
            setSets((current) => [s, ...current]);
            setShowCreate(false);
            setSelectedSet(s);
          }}
        />
      )}
    </div>
  );
}
