import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  UserCog,
  Lock,
  Unlock,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { useAdminAuth } from "@/lib/AdminAuthContext";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  content_manager: "Quản lý nội dung",
  user: "Người dùng",
};

const ROLE_COLORS = {
  admin: "bg-violet-50 text-violet-600 border-violet-200",
  content_manager: "bg-blue-50 text-blue-600 border-blue-200",
  user: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Bị khóa",
};

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  inactive: "bg-red-50 text-red-600 border-red-200",
};

export default function AdminUsers() {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("user"); // Mặc định chỉ hiển thị người dùng thường, loại trừ admin
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;

  useEffect(() => {
    loadUsers();
  }, [page, search, sortField, sortOrder, status, role]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await adminApi.getUsers({
        page,
        limit,
        search,
        sortField,
        sortOrder,
        status,
        role,
      });
      setUsers(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setSelectedUser({ id: userId, currentStatus });
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;
    setActionLoading("status");
    try {
      const newStatus = selectedUser.currentStatus === "active" ? "inactive" : "active";
      await adminApi.updateUserStatus([selectedUser.id], newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: newStatus } : u
        )
      );
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantRole = (userId, currentRole) => {
    setSelectedUser({ id: userId, currentRole });
    setShowRoleModal(true);
  };

  const confirmGrantRole = async (role, action) => {
    if (!selectedUser) return;
    setActionLoading("role");
    try {
      await adminApi.updateUserRole(selectedUser.id, role, action);
      await loadUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Cập nhật vai trò thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này? Tài khoản chỉ có thể xóa khi đang ở trạng thái bị khóa.")) return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "Xóa tài khoản thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-pink-500" />
          Quản lý Người dùng
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Khóa/mở khóa tài khoản và cấp quyền quản lý nội dung cho người dùng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            />
          </div>

          {/* Role filter */}
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white"
          >
            <option value="user">Người dùng</option>
            <option value="content_manager">Quản lý nội dung</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortField}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":");
              setSortField(field);
              setSortOrder(order);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white"
          >
            <option value="created_at:desc">Mới nhất</option>
            <option value="created_at:asc">Cũ nhất</option>
            <option value="email:asc">Email A-Z</option>
            <option value="email:desc">Email Z-A</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline">Đóng</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-pink-500 mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Không có người dùng nào</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {(user.userName || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.userName || "—"}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                      {user.role === "admin" && <Shield className="w-3 h-3" />}
                      {user.role === "content_manager" && <UserCog className="w-3 h-3" />}
                      {ROLE_LABELS[user.role] || "Người dùng"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>
                      {user.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {STATUS_LABELS[user.status] || "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === "active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                        title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.status === "active" ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>

                      {/* Grant/Revoke content_manager role */}
                      <button
                        onClick={() => handleGrantRole(user.id, user.role)}
                        className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                        title={user.role === "content_manager" ? "Thu hồi quyền quản lý" : "Cấp quyền quản lý nội dung"}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserCog className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete (only inactive) */}
                      {user.status === "inactive" && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1 text-sm font-bold text-slate-600">
            Trang {page} / {totalPages} — {total} người dùng
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toggle Status Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedUser.currentStatus === "active"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                  {selectedUser.currentStatus === "active" ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedUser.currentStatus === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedUser.currentStatus === "active"
                      ? "Tài khoản sẽ không thể đăng nhập cho đến khi được mở khóa."
                      : "Tài khoản sẽ có thể đăng nhập trở lại."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmToggleStatus}
                  disabled={actionLoading === "status"}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all disabled:opacity-50 ${
                    selectedUser.currentStatus === "active"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {actionLoading === "status" ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cấp quyền quản lý nội dung</h3>
                  <p className="text-sm text-slate-500">
                    {selectedUser.currentRole === "content_manager"
                      ? "Thu hồi quyền quản lý nội dung khỏi tài khoản này."
                      : "Cấp quyền quản lý nội dung cho tài khoản này. Admin manager có thể thêm, sửa, xóa và duyệt nội dung nhưng không thể quản lý người dùng."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                {selectedUser.currentRole === "content_manager" ? (
                  <button
                    onClick={() => confirmGrantRole("content_manager", "revoke")}
                    disabled={actionLoading === "role"}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-md transition-all disabled:opacity-50"
                  >
                    {actionLoading === "role" ? "Đang xử lý..." : "Thu hồi"}
                  </button>
                ) : (
                  <button
                    onClick={() => confirmGrantRole("content_manager", "grant")}
                    disabled={actionLoading === "role"}
                    className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 shadow-md transition-all disabled:opacity-50"
                  >
                    {actionLoading === "role" ? "Đang xử lý..." : "Cấp quyền"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
