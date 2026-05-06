import { Trophy } from "lucide-react";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">🏆 Bảng xếp hạng</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top người dùng có chuỗi học dài nhất
        </p>
      </div>

      <div className="text-center py-16">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-foreground font-bold text-lg">Chưa có dữ liệu</p>
        <p className="text-muted-foreground text-sm mt-1">
          Backend hiện chưa cung cấp API leaderboard.
        </p>
      </div>
    </div>
  );
}
