import { useState, useEffect, useCallback } from "react";
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
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/api/admin/adminApi";

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

// Lấy role chính của user (ưu tiên: admin > content_manager > user)
const getPrimaryRole = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) return "user";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("content_manager")) return "content_manager";
  return "user";
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await adminApi.getUsers({
        page,
        limit,
        search: debouncedSearch,
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
  }, [page, debouncedSearch, sortField, sortOrder, status, role, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Tải chi tiết người dùng
  const handleViewDetail = async (userId) => {
    setSelectedUser({ id: userId });
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    setUserDetail(null);
    try {
      const res = await adminApi.getUserById(userId);
      setUserDetail(res.data);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết người dùng");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Toggle trạng thái người dùng
  const handleToggleStatus = (userId, currentStatus) => {
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
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
      );
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Cấp hoặc thu hồi vai trò
  const handleGrantRole = (userId, roles) => {
    setSelectedUser({ id: userId, roles: roles || [] });
    setShowRoleModal(true);
  };

  const confirmGrantRole = async (targetRole, action) => {
    if (!selectedUser) return;
    setActionLoading("role");
    try {
      await adminApi.updateUserRole(selectedUser.id, targetRole, action);
      await loadUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Cập nhật vai trò thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Xóa tài khoản
  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa tài khoản này?\nTài khoản chỉ có thể xóa khi đang ở trạng thái bị khóa.\nHành động này không thể hoàn tác."
      )
    )
      return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message || "Xóa tài khoản thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const primaryRole = selectedUser ? getPrimaryRole(selectedUser.roles) : "user";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-pink-500" />
          Quản lý Người dùng
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Xem, khóa/mở khóa tài khoản và cấp quyền quản lý nội dung cho người dùng
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
              onChange={(e) => setSearch(e.target.value)}
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
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white min-w-[160px]"
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="content_manager">Quản lý nội dung</option>
            <option value="admin">Quản trị viên</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white min-w-[160px]"
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
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 bg-white min-w-[160px]"
          >
            <option value="created_at:desc">Mới nhất</option>
            <option value="created_at:asc">Cũ nhất</option>
            <option value="email:asc">Email A → Z</option>
            <option value="email:desc">Email Z → A</option>
            <option value="status:asc">Trạng thái A → Z</option>
            <option value="status:desc">Trạng thái Z → A</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline hover:no-underline">
            Đóng
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Hành động
              </th>
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
                  <p className="text-slate-400 text-sm mt-1">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const uRoles = user.roles || [];
                const uPrimaryRole = getPrimaryRole(uRoles);
                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {(user.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[uPrimaryRole]}`}
                        >
                          {uPrimaryRole === "admin" && <Shield className="w-3 h-3" />}
                          {uPrimaryRole === "content_manager" && <UserCog className="w-3 h-3" />}
                          {ROLE_LABELS[uPrimaryRole]}
                        </span>
                        {uRoles.length > 1 && (
                          <span className="text-xs text-slate-400">
                            +{uRoles.length - 1} vai trò
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}
                      >
                        {user.status === "active" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {STATUS_LABELS[user.status] || "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(user.id)}
                          className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Toggle status */}
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          disabled={actionLoading !== null}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.status === "active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {actionLoading !== null ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.status === "active" ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>

                        {/* Cấp / thu hồi content_manager */}
                        <button
                          onClick={() => handleGrantRole(user.id, uRoles)}
                          disabled={actionLoading !== null}
                          className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-50"
                          title={
                            uPrimaryRole === "content_manager"
                              ? "Thu hồi quyền quản lý"
                              : "Cấp quyền quản lý nội dung"
                          }
                        >
                          <UserCog className="w-4 h-4" />
                        </button>

                        {/* Xóa (chỉ inactive) */}
                        {user.status === "inactive" && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Xóa tài khoản vĩnh viễn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
            <span>Trang</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
              }}
              className="w-14 text-center px-2 py-1 rounded-lg border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            />
            <span>/ {totalPages}</span>
            <span className="text-slate-400 font-normal ml-2">— {total} người dùng</span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============ MODALS ============ */}

      {/* Modal Toggle Status */}
      {showStatusModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedUser.currentStatus === "active"
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {selectedUser.currentStatus === "active" ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <Unlock className="w-6 h-6" />
                  )}
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
                  {actionLoading === "status" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                    </span>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Grant/Revoke Role */}
      {showRoleModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cấp / Thu hồi vai trò</h3>
                  <p className="text-sm text-slate-500">
                    Chọn vai trò và thao tác phù hợp cho tài khoản này
                  </p>
                </div>
              </div>

              {/* Current roles */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  Vai trò hiện tại
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.length === 0 ? (
                    <span className="text-sm text-slate-400">Không có vai trò đặc biệt</span>
                  ) : (
                    selectedUser.roles.map((r) => (
                      <span
                        key={r}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[r] || ROLE_COLORS.user}`}
                      >
                        {r === "admin" && <Shield className="w-3 h-3" />}
                        {r === "content_manager" && <UserCog className="w-3 h-3" />}
                        {ROLE_LABELS[r]}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Role actions */}
              <div className="space-y-3 mb-6">
                {primaryRole !== "admin" && (
                  <button
                    onClick={() => confirmGrantRole("content_manager", "grant")}
                    disabled={actionLoading === "role"}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Cấp quyền Quản lý nội dung</p>
                      <p className="text-xs text-slate-500">
                        Cho phép thêm, sửa, xóa và duyệt nội dung
                      </p>
                    </div>
                  </button>
                )}
                {primaryRole === "content_manager" && (
                  <button
                    onClick={() => confirmGrantRole("content_manager", "revoke")}
                    disabled={actionLoading === "role"}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Thu hồi Quản lý nội dung</p>
                      <p className="text-xs text-slate-500">Thu hồi toàn bộ quyền quản lý nội dung</p>
                    </div>
                  </button>
                )}
                {primaryRole !== "user" && (
                  <button
                    onClick={() => confirmGrantRole("user", "revoke")}
                    disabled={actionLoading === "role"}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Thu hồi tất cả vai trò đặc biệt</p>
                      <p className="text-xs text-slate-500">Chỉ còn vai trò Người dùng thường</p>
                    </div>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết người dùng */}
      {showDetailModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-lg font-black text-slate-900">Chi tiết người dùng</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                </div>
              ) : userDetail ? (
                <div className="space-y-4">
                  {/* Avatar + email */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {(userDetail.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{userDetail.email}</p>
                      <p className="text-xs text-slate-400">{userDetail.id}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Trạng thái</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[userDetail.status] || STATUS_COLORS.active}`}
                    >
                      {userDetail.status === "active" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      {STATUS_LABELS[userDetail.status] || "Hoạt động"}
                    </span>
                  </div>

                  {/* Ngày tạo */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Ngày tạo tài khoản</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatDate(userDetail.createdAt)}
                    </span>
                  </div>

                  {/* Ngày cập nhật */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Cập nhật gần nhất</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatDate(userDetail.updatedAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p>Không thể tải thông tin người dùng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
