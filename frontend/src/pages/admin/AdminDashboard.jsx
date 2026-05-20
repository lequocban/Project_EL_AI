import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Map vai trò từ role_id sang label
const ROLE_LABELS = {
  1: "Người dùng",
  2: "Content Manager",
  3: "Quản trị viên",
};

// Lấy danh sách người dùng với phân trang và bộ lọc trạng thái
const fetchUsers = async ({ page = 1, limit = 100, status = "" }) => {
  const res = await adminApi.getUsers({ page, limit, status });
  return res.data;
};

// Lấy danh sách bộ từ vựng với phân trang và tìm kiếm
const fetchVocabSets = async ({ page = 1, limit = 100, keyword = "" } = {}) => {
  const res = await adminApi.getAllVocabularySets({ page, limit, keyword });
  return res.data;
};

// Lấy danh sách bài luyện đọc với phân trang và tìm kiếm
const fetchReadingLessons = async ({ page = 1, limit = 100, keyword = "" } = {}) => {
  const res = await adminApi.getAllReadingLessons({ page, limit, keyword });
  return res.data;
};

// Lấy danh sách bài luyện nghe với phân trang và tìm kiếm
const fetchListeningLessons = async ({ page = 1, limit = 100, keyword = "" } = {}) => {
  const res = await adminApi.getAllListeningLessons({ page, limit, keyword });
  return res.data;
};

// Component Dialog chi tiết người dùng
function UsersDialog({ open, onClose }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dialogUsers", statusFilter],
    queryFn: () => fetchUsers({ page: 1, limit: 200, status: statusFilter === "all" ? "" : statusFilter }),
    enabled: open,
  });

  const users = data?.users ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" />
              Danh sách người dùng
            </DialogTitle>
            <Badge variant="secondary">{users.length} người dùng</Badge>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">STT</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Tên người dùng</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Email</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Vai trò</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">Không có người dùng nào</td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">{user.full_name || user.name || "—"}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{user.email || "—"}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={
                              user.role_id === 3
                                ? "bg-violet-100 text-violet-700"
                                : user.role_id === 2
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }
                          >
                            {user.role_name || ROLE_LABELS[user.role_id] || "Người dùng"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              user.status === "active"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-600"
                            }
                          >
                            {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component Dialog chi tiết Bộ từ vựng
function VocabSetsDialog({ open, onClose }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dialogVocabSets", statusFilter],
    queryFn: () => fetchVocabSets({ page: 1, limit: 200, keyword: "" }),
    enabled: open,
  });

  const sets = data?.vocabularySets ?? data ?? [];
  const filtered = statusFilter === "all" ? sets : sets.filter((s) => s.status === statusFilter);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Danh sách bộ từ vựng
            </DialogTitle>
            <Badge variant="secondary">{filtered.length} bộ</Badge>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">STT</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Tên bộ từ vựng</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Người tạo</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Số từ</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">Không có bộ từ vựng nào</td>
                    </tr>
                  ) : (
                    filtered.map((set, index) => (
                      <tr key={set.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap max-w-xs truncate">{set.title || set.name}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{set.creator_name || set.user?.full_name || set.user?.name || "—"}</td>
                        <td className="py-3 px-3 text-slate-600">{set.word_count ?? set.words?.length ?? 0}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              set.status === "public"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }
                          >
                            {set.status === "public" ? "Công khai" : "Riêng tư"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {set.created_at ? new Date(set.created_at).toLocaleDateString("vi-VN") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component Dialog chi tiết Bài luyện đọc
function ReadingDialog({ open, onClose }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dialogReading", statusFilter],
    queryFn: () => fetchReadingLessons({ page: 1, limit: 200, keyword: "" }),
    enabled: open,
  });

  const lessons = data?.readingLessons ?? data ?? [];
  const filtered = statusFilter === "all" ? lessons : lessons.filter((l) => l.status === statusFilter);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookText className="w-5 h-5 text-orange-500" />
              Danh sách bài luyện đọc
            </DialogTitle>
            <Badge variant="secondary">{filtered.length} bài</Badge>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">STT</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Tiêu đề</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Người tạo</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Số câu hỏi</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">Không có bài luyện đọc nào</td>
                    </tr>
                  ) : (
                    filtered.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap max-w-xs truncate">{lesson.title}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{lesson.creator_name || lesson.user?.full_name || lesson.user?.name || "—"}</td>
                        <td className="py-3 px-3 text-slate-600">{lesson.question_count ?? lesson.questions?.length ?? 0}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              lesson.status === "public"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }
                          >
                            {lesson.status === "public" ? "Công khai" : "Riêng tư"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString("vi-VN") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component Dialog chi tiết Bài luyện nghe
function ListeningDialog({ open, onClose }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dialogListening", statusFilter],
    queryFn: () => fetchListeningLessons({ page: 1, limit: 200, keyword: "" }),
    enabled: open,
  });

  const lessons = data?.listeningLessons ?? data ?? [];
  const filtered = statusFilter === "all" ? lessons : lessons.filter((l) => l.status === statusFilter);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Headphones className="w-5 h-5 text-green-500" />
              Danh sách bài luyện nghe
            </DialogTitle>
            <Badge variant="secondary">{filtered.length} bài</Badge>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">STT</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Tiêu đề</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Người tạo</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Số câu hỏi</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 whitespace-nowrap">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">Không có bài luyện nghe nào</td>
                    </tr>
                  ) : (
                    filtered.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap max-w-xs truncate">{lesson.title}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{lesson.creator_name || lesson.user?.full_name || lesson.user?.name || "—"}</td>
                        <td className="py-3 px-3 text-slate-600">{lesson.question_count ?? lesson.questions?.length ?? 0}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              lesson.status === "public"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }
                          >
                            {lesson.status === "public" ? "Công khai" : "Riêng tư"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString("vi-VN") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Trang tổng quan admin với thống kê và biểu đồ hệ thống
export default function AdminDashboard() {
  const { data: stats, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "systemStats"],
    queryFn: fetchSystemStats,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [vocabDialogOpen, setVocabDialogOpen] = useState(false);
  const [readingDialogOpen, setReadingDialogOpen] = useState(false);
  const [listeningDialogOpen, setListeningDialogOpen] = useState(false);

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
                    onClick={() => setUsersDialogOpen(true)}
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
                    onClick={() => setVocabDialogOpen(true)}
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
                    onClick={() => setReadingDialogOpen(true)}
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
                    onClick={() => setListeningDialogOpen(true)}
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

      {/* Các Dialog */}
      <UsersDialog open={usersDialogOpen} onClose={setUsersDialogOpen} />
      <VocabSetsDialog open={vocabDialogOpen} onClose={setVocabDialogOpen} />
      <ReadingDialog open={readingDialogOpen} onClose={setReadingDialogOpen} />
      <ListeningDialog open={listeningDialogOpen} onClose={setListeningDialogOpen} />
    </div>
  );
}
