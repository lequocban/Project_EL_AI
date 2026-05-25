import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  BookText,
  Headphones,
  RefreshCw,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Lấy thống kê hệ thống từ API admin
const fetchSystemStats = async () => {
  const res = await adminApi.getStats();
  return res.data;
};

const COLORS = {
  violet: "#7c3aed",
  green: "#10b981",
  orange: "#f97316",
  blue: "#2563eb",
};



// Trang tổng quan admin với thống kê và biểu đồ hệ thống
export default function AdminDashboard() {
  const { data: stats, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "systemStats"],
    queryFn: fetchSystemStats,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Dữ liệu biểu đồ tổng quan nội dung học tập
  const contentData = [
    {
      name: "Từ vựng",
      Tong: stats?.vocabularySets?.total ?? 0,
      CongKhai: stats?.vocabularySets?.public ?? 0,
      SoLanLuyenTap: stats?.vocabularySets?.practiceCount ?? 0,
    },
    {
      name: "Luyện đọc",
      Tong: stats?.readingLessons?.total ?? 0,
      CongKhai: stats?.readingLessons?.public ?? 0,
      SoLanLuyenTap: stats?.readingLessons?.practiceCount ?? 0,
    },
    {
      name: "Luyện nghe",
      Tong: stats?.listeningLessons?.total ?? 0,
      CongKhai: stats?.listeningLessons?.public ?? 0,
      SoLanLuyenTap: stats?.listeningLessons?.practiceCount ?? 0,
    },
  ];

  // Tính toán các giá trị pending (lấy từ hiệu số total - public)
  const pendingVocabulary = (stats?.vocabularySets?.total ?? 0) - (stats?.vocabularySets?.public ?? 0);
  const pendingReading = (stats?.readingLessons?.total ?? 0) - (stats?.readingLessons?.public ?? 0);
  const pendingListening = (stats?.listeningLessons?.total ?? 0) - (stats?.listeningLessons?.public ?? 0);

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500 mt-1 font-medium">Thống kê chi tiết toàn bộ hoạt động</p>
        </div>

        {isError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <RefreshCw className="w-4 h-4" />
              Không thể tải thống kê hệ thống.
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-red-600 hover:text-red-700">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
          </div>
        )}

        {isFetching && !isLoading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang cập nhật...
          </div>
        )}

        {/* ========== HÀNG 1: 4 THẺ CHÍNH ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Thẻ Tổng người dùng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-violet-500 to-indigo-500">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Người dùng</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 font-medium">Tổng số</div>
                <div className="text-2xl font-black text-slate-900">{(stats?.users?.total ?? 0).toLocaleString()}</div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Đang hoạt động</div>
                    <div className="text-lg font-bold text-green-600">{(stats?.users?.active ?? 0).toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1"
                    onClick={() => navigate("/admin/users")}
                  >
                    Xem thêm <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ Bộ từ vựng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-500 to-cyan-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Bộ từ vựng</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 font-medium">Tổng số</div>
                <div className="text-2xl font-black text-slate-900">{(stats?.vocabularySets?.total ?? 0).toLocaleString()}</div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Công khai</div>
                    <div className="text-lg font-bold text-green-600">{(stats?.vocabularySets?.public ?? 0).toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                    onClick={() => navigate("/admin/vocabulary")}
                  >
                    Xem thêm <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ Bài luyện đọc */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-orange-500 to-amber-500">
              <div className="flex items-center gap-2">
                <BookText className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Bài luyện đọc</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 font-medium">Tổng số</div>
                <div className="text-2xl font-black text-slate-900">{(stats?.readingLessons?.total ?? 0).toLocaleString()}</div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Công khai</div>
                    <div className="text-lg font-bold text-green-600">{(stats?.readingLessons?.public ?? 0).toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1"
                    onClick={() => navigate("/admin/reading")}
                  >
                    Xem thêm <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ Bài luyện nghe */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-green-500 to-teal-500">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Bài luyện nghe</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 font-medium">Tổng số</div>
                <div className="text-2xl font-black text-slate-900">{(stats?.listeningLessons?.total ?? 0).toLocaleString()}</div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Công khai</div>
                    <div className="text-lg font-bold text-green-600">{(stats?.listeningLessons?.public ?? 0).toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                    onClick={() => navigate("/admin/listening")}
                  >
                    Xem thêm <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== HÀNG 2: BIỂU ĐỒ TỔNG QUAN NỘI DUNG HỌC TẬP ========== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Tổng quan nội dung học tập</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={contentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <Bar dataKey="Tong" name="Tổng số" fill={COLORS.violet} radius={[4, 4, 0, 0]} />
              <Bar dataKey="CongKhai" name="Công khai" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="SoLanLuyenTap" name="Số lần luyện tập" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ========== HÀNG 3: BẢNG CHỜ KIỂM DUYỆT ========== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-base font-bold text-slate-800">Nội dung chờ kiểm duyệt</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Loại nội dung</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Tổng số</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Công khai</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Riêng tư</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Số lần luyện tập</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">Tỷ lệ công khai</th>
                </tr>
              </thead>
              <tbody>
                {/* Bộ từ vựng */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Bộ từ vựng
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">{(stats?.vocabularySets?.total ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">{(stats?.vocabularySets?.public ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{pendingVocabulary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">{(stats?.vocabularySets?.practiceCount ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={
                        (stats?.vocabularySets?.total ?? 0) > 0
                          ? (stats.vocabularySets.public / stats.vocabularySets.total * 100) >= 80
                            ? "border-green-200 bg-green-50 text-green-700"
                            : (stats.vocabularySets.public / stats.vocabularySets.total * 100) >= 50
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border-red-200 bg-red-50 text-red-600"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }
                    >
                      {(stats?.vocabularySets?.total ?? 0) > 0
                        ? Math.round((stats.vocabularySets.public / stats.vocabularySets.total) * 100)
                        : 0}%
                    </Badge>
                  </td>
                </tr>
                {/* Bài luyện đọc */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookText className="w-4 h-4 text-orange-500" />
                      Bài luyện đọc
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">{(stats?.readingLessons?.total ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">{(stats?.readingLessons?.public ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{pendingReading.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">{(stats?.readingLessons?.practiceCount ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={
                        (stats?.readingLessons?.total ?? 0) > 0
                          ? (stats.readingLessons.public / stats.readingLessons.total * 100) >= 80
                            ? "border-green-200 bg-green-50 text-green-700"
                            : (stats.readingLessons.public / stats.readingLessons.total * 100) >= 50
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border-red-200 bg-red-50 text-red-600"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }
                    >
                      {(stats?.readingLessons?.total ?? 0) > 0
                        ? Math.round((stats.readingLessons.public / stats.readingLessons.total) * 100)
                        : 0}%
                    </Badge>
                  </td>
                </tr>
                {/* Bài luyện nghe */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-green-500" />
                      Bài luyện nghe
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">{(stats?.listeningLessons?.total ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold">{(stats?.listeningLessons?.public ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{pendingListening.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-orange-600 font-semibold">{(stats?.listeningLessons?.practiceCount ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={
                        (stats?.listeningLessons?.total ?? 0) > 0
                          ? (stats.listeningLessons.public / stats.listeningLessons.total * 100) >= 80
                            ? "border-green-200 bg-green-50 text-green-700"
                            : (stats.listeningLessons.public / stats.listeningLessons.total * 100) >= 50
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border-red-200 bg-red-50 text-red-600"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }
                    >
                      {(stats?.listeningLessons?.total ?? 0) > 0
                        ? Math.round((stats.listeningLessons.public / stats.listeningLessons.total) * 100)
                        : 0}%
                    </Badge>
                  </td>
                </tr>
                {/* Tổng cộng */}
                <tr className="bg-slate-50 font-semibold">
                  <td className="py-3 px-4 text-slate-800 whitespace-nowrap">Tổng cộng</td>
                  <td className="py-3 px-4 text-center text-slate-800">
                    {(
                      (stats?.vocabularySets?.total ?? 0) +
                      (stats?.readingLessons?.total ?? 0) +
                      (stats?.listeningLessons?.total ?? 0)
                    ).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-green-600">
                    {(
                      (stats?.vocabularySets?.public ?? 0) +
                      (stats?.readingLessons?.public ?? 0) +
                      (stats?.listeningLessons?.public ?? 0)
                    ).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {(pendingVocabulary + pendingReading + pendingListening).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-orange-600">
                    {(
                      (stats?.vocabularySets?.practiceCount ?? 0) +
                      (stats?.readingLessons?.practiceCount ?? 0) +
                      (stats?.listeningLessons?.practiceCount ?? 0)
                    ).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                      Tổng hợp
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
