import { useState, useEffect } from "react";
import base44 from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Trophy, Flame, Zap, Crown, Medal } from "lucide-react";

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser]);

  const loadData = async () => {
    const streaks = await base44.entities.UserStreak.list(
      "-current_streak",
      50,
    );
    const merged = streaks
      .map((s) => ({
        ...s,
        full_name: s.created_by?.split("@")[0] || "Người dùng",
        email: s.created_by,
      }))
      .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
    setLeaders(merged);
    setLoading(false);
  };

  const getRankIcon = (i) => {
    if (i === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-black text-muted-foreground">
        {i + 1}
      </span>
    );
  };

  const myRank = leaders.findIndex((l) => l.email === currentUser?.email);

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">
          🏆 Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top người dùng có chuỗi học dài nhất
        </p>
      </div>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[leaders[1], leaders[0], leaders[2]].map((l, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
            const colors = {
              1: "from-yellow-400 to-amber-500",
              2: "from-slate-300 to-slate-400",
              3: "from-amber-600 to-amber-700",
            };
            return (
              <div
                key={l?.id || podiumIdx}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-black text-lg shadow-md">
                  {l?.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <p className="text-xs font-bold text-foreground text-center truncate w-full px-1">
                  {l?.full_name || "-"}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">
                  {l?.current_streak || 0} 🔥
                </p>
                <div
                  className={`w-full bg-gradient-to-t ${colors[rank]} rounded-t-xl ${heights[rank]} flex items-start justify-center pt-2`}
                >
                  <span className="text-white font-black text-lg">{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My rank highlight */}
      {myRank >= 0 && (
        <div className="bg-primary/10 border-2 border-primary rounded-2xl p-4 mb-4 flex items-center gap-4">
          <span className="text-sm font-black text-primary">
            Hạng của bạn: #{myRank + 1}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-black text-foreground">
              {leaders[myRank]?.current_streak || 0} ngày
            </span>
          </div>
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-semibold">
            Chưa có dữ liệu xếp hạng
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((l, i) => {
            const isMe = l.email === currentUser?.email;
            return (
              <div
                key={l.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${isMe ? "border-primary shadow-md" : "border-border"}`}
              >
                <div className="w-8 flex justify-center">{getRankIcon(i)}</div>
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                  {l.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {l.full_name}{" "}
                    {isMe && (
                      <span className="text-xs text-primary font-semibold">
                        (bạn)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-black text-sm">
                      {l.current_streak || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-black text-sm text-muted-foreground">
                      {l.total_xp || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
