import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet, AlertTriangle,
  CheckCircle, ChevronLeft, Check, X, RefreshCcw, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/layout/Header";
// import { statusLabels, statusColors } from "@/lib/mockData";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const sidebarItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", value: "dashboard" },
  { icon: Users, label: "المستخدمون", value: "users" },
  { icon: Package, label: "الخدمات", value: "services" },
  { icon: ShoppingCart, label: "الطلبات", value: "orders" },
  { icon: CheckCircle, label: "الإيداعات", value: "deposits" },
  { icon: Wallet, label: "السحوبات", value: "withdrawals" },
  { icon: AlertTriangle, label: "النزاعات", value: "disputes" },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const utils = trpc.useUtils();

  // Modal states
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Queries
  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    retry: false,
    staleTime: 30000,
  });
  const { data: users } = trpc.admin.users.useQuery(undefined, { enabled: activeTab === "users" });
  const { data: pendingServices } = trpc.admin.services.useQuery(undefined, { enabled: activeTab === "dashboard" || activeTab === "services" });
  const { data: withdrawals } = trpc.admin.withdrawals.useQuery(undefined, { enabled: activeTab === "withdrawals" });
  const { data: deposits } = trpc.admin.deposits.useQuery(undefined, { enabled: activeTab === "deposits" });
  const { data: disputes } = trpc.disputes.adminList.useQuery(undefined, { enabled: activeTab === "disputes" });

  // Mutations
  const approveService = trpc.admin.approveService.useMutation({
    onSuccess: () => {
      toast.success("تم قبول الخدمة بنجاح");
      utils.admin.services.invalidate();
    }
  });

  const rejectService = trpc.admin.rejectService.useMutation({
    onSuccess: () => {
      toast.error("تم رفض الخدمة");
      utils.admin.services.invalidate();
    }
  });

  const approveDeposit = trpc.admin.approveDeposit.useMutation({
    onSuccess: () => {
      toast.success("تم شحن الرصيد للمستخدم بنجاح");
      utils.admin.deposits.invalidate();
      utils.admin.stats.invalidate();
    }
  });

  const adjustBalance = trpc.admin.adjustBalance.useMutation({
    onSuccess: () => {
      toast.success("تم تعديل الرصيد بنجاح");
      setIsBalanceModalOpen(false);
      setBalanceAmount("");
      setAdjustNote("");
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    }
  });

  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث رتبة المستخدم بنجاح");
      setIsRoleModalOpen(false);
      utils.admin.users.invalidate();
    }
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم وكافة بياناته بنجاح");
      setIsDeleteModalOpen(false);
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    }
  });

  const updateWithdrawal = trpc.admin.updateWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة طلب السحب");
      utils.admin.withdrawals.invalidate();
      utils.admin.stats.invalidate();
    }
  });

  const resolveDispute = trpc.disputes.adminResolve.useMutation({
    onSuccess: async () => {
      toast.success("تم حل النزاع بنجاح");
      await utils.disputes.adminList.invalidate();
      await utils.admin.stats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في حل النزاع");
    },
  });

  const dashboardStats = [
    { label: "إجمالي المبيعات", value: stats?.totalSales ?? 0, icon: ShoppingCart, color: "bg-blue-50 text-blue-600", isCurrency: true },
    { label: "رصيد المستخدمين", value: stats?.totalWalletBalance ?? 0, icon: Wallet, color: "bg-[#E8F5F0] text-[#0D5D48]", isCurrency: true },
    { label: "طلبات الشحن المعلقة", value: stats?.pendingDepositsCount ?? 0, icon: CheckCircle, color: "bg-amber-50 text-amber-600" },
    { label: "النزاعات المفتوحة", value: stats?.disputes ?? 0, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    { label: "إجمالي المستخدمين", value: stats?.users ?? 0, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "إجمالي الطلبات", value: stats?.orders ?? 0, icon: ShoppingCart, color: "bg-indigo-50 text-indigo-600" },
  ];

  const mobileNavItems = sidebarItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5DF] z-40 px-2 py-2">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                activeTab === item.value
                  ? "text-[#0D5D48]"
                  : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A2E]">لوحة الإدارة</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setActiveTab(item.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item.value
                      ? "bg-[#0D5D48] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pt-[72px] flex pb-20 md:pb-0">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l border-[#E5E5DF] h-[calc(100vh-72px)] sticky top-[72px] hidden md:block">
          <div className="p-6">
            <h1 className="text-xl font-black text-[#1A1A2E] mb-6">لوحة الإدارة</h1>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.value
                    ? "bg-[#0D5D48] text-white shadow-lg shadow-[#0D5D48]/20"
                    : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.value === "disputes" && (stats?.disputes ?? 0) > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {stats?.disputes}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-8">
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">لوحة التحكم العامة</h2>
                <Button variant="outline" size="sm" onClick={() => utils.admin.stats.invalidate()} className="rounded-xl gap-2 h-9">
                  <RefreshCcw className="w-4 h-4" /> تحديث البيانات
                </Button>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {dashboardStats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-[#1A1A2E]">
                      {stat.isCurrency ? `${Number(stat.value).toLocaleString()} ل.س` : stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#1A1A2E]">طلبات شحن وتوثيق معلقة</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-0">{stats?.pendingDepositsCount ?? 0} إيداع</Badge>
                      <Badge variant="secondary" className="bg-red-50 text-red-600 border-0">{pendingServices?.length ?? 0} خدمة</Badge>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {pendingServices?.map((service: any) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#0D5D48]/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1A1A2E] line-clamp-1">{service.title}</p>
                            <p className="text-[10px] text-gray-500">{service.sellerName} | {service.categoryName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" className="w-8 h-8 rounded-lg bg-green-600 hover:bg-green-700" onClick={() => approveService.mutate({ id: service.id })}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="destructive" className="w-8 h-8 rounded-lg" onClick={() => rejectService.mutate({ id: service.id })}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!pendingServices || pendingServices.length === 0) && (
                      <p className="text-gray-400 text-center py-10 text-sm italic">لا توجد خدمات بانتظار المراجعة</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
                  <h3 className="font-bold text-[#1A1A2E] mb-6">سرعة الوصول</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab("users")} className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-center hover:bg-blue-100 transition-colors">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-xs font-bold">إدارة الأعضاء</span>
                    </button>
                    <button onClick={() => setActiveTab("withdrawals")} className="p-4 bg-amber-50 text-amber-600 rounded-2xl text-center hover:bg-amber-100 transition-colors">
                      <Wallet className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-xs font-bold">طلبات السحب</span>
                    </button>
                    <button onClick={() => setActiveTab("disputes")} className="p-4 bg-red-50 text-red-600 rounded-2xl text-center hover:bg-red-100 transition-colors relative">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-xs font-bold">النزاعات</span>
                      {(stats?.disputes ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {stats?.disputes}
                        </span>
                      )}
                    </button>
                    <button onClick={() => setActiveTab("orders")} className="p-4 bg-[#E8F5F0] text-[#0D5D48] rounded-2xl text-center hover:bg-[#D4EBE1] transition-colors">
                      <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-xs font-bold">كل الطلبات</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">إدارة المستخدمين</h2>
                <Badge variant="outline" className="bg-white">{users?.length ?? 0} مستخدم إجمالي</Badge>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white border border-[#E5E5DF] p-1 h-auto rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl px-6 py-2 text-xs font-bold data-[state=active]:bg-[#0D5D48] data-[state=active]:text-white">الكل</TabsTrigger>
                  <TabsTrigger value="sellers" className="rounded-xl px-6 py-2 text-xs font-bold data-[state=active]:bg-[#0D5D48] data-[state=active]:text-white">البائعون</TabsTrigger>
                  <TabsTrigger value="buyers" className="rounded-xl px-6 py-2 text-xs font-bold data-[state=active]:bg-[#0D5D48] data-[state=active]:text-white">المشترون</TabsTrigger>
                </TabsList>

                {["all", "sellers", "buyers"].map((type) => (
                  <TabsContent key={type} value={type}>
                    <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5DF]/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-right">المستخدم</TableHead>
                            <TableHead className="text-right">الدور</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">تاريخ الانضمام</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.filter((u: any) => {
                            if (type === "sellers") return u.role === "seller";
                            if (type === "buyers") return u.role === "buyer";
                            return true;
                          }).map((u: any) => (
                            <TableRow key={u.id} className="hover:bg-gray-50/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                                  <div>
                                    <p className="font-bold text-sm text-[#1A1A2E]">{u.name}</p>
                                    <p className="text-[10px] text-gray-500">{u.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0 text-[10px]">{u.role}</Badge></TableCell>
                              <TableCell><Badge className={`${u.status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"} border-0 text-[10px]`}>{u.status}</Badge></TableCell>
                              <TableCell className="text-xs text-gray-500">{new Date(u.createdAt || "").toLocaleDateString("ar-SY")}</TableCell>
                              <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setIsBalanceModalOpen(true);
                                      }}
                                      size="sm" variant="outline" className="rounded-xl h-8 text-[10px] border-[#0D5D48] text-[#0D5D48] hover:bg-[#0D5D48]/5">تعديل الرصيد</Button>
                                    
                                    <Button
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setSelectedRole(u.role);
                                        setIsRoleModalOpen(true);
                                      }}
                                      size="sm" variant="outline" className="rounded-xl h-8 text-[10px] border-amber-500 text-amber-600 hover:bg-amber-50">تغيير الرتبة</Button>
                                    
                                    <Button 
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setIsDeleteModalOpen(true);
                                      }}
                                      size="sm" variant="outline" className="rounded-xl h-8 text-[10px] border-red-500 text-red-600 hover:bg-red-50">حذف</Button>
                                  </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Balance Adjustment Modal */}
              {isBalanceModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-6">تعديل رصيد: {selectedUser.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 mb-1.5 block px-1">المبلغ (سالب للخصم، موجب للإضافة)</label>
                        <input
                          type="number"
                          value={balanceAmount}
                          onChange={(e) => setBalanceAmount(e.target.value)}
                          placeholder="مثال: 5000 أو -2000"
                          className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#0D5D48] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 mb-1.5 block px-1">سبب التعديل (ملاحظة)</label>
                        <input
                          type="text"
                          value={adjustNote}
                          onChange={(e) => setAdjustNote(e.target.value)}
                          placeholder="مثال: تعويض عن طلب ملغى"
                          className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#0D5D48] outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                      <Button
                        disabled={adjustBalance.isPending}
                        onClick={() => adjustBalance.mutate({ userId: selectedUser.id, amount: balanceAmount, description: adjustNote })}
                        className="flex-1 bg-[#0D5D48] hover:bg-[#0A4A3A] rounded-xl h-12 font-bold shadow-lg shadow-[#0D5D48]/20"
                      >
                        {adjustBalance.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsBalanceModalOpen(false)}
                        className="flex-1 h-12 rounded-xl text-gray-400 font-bold"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Management Modal */}
              {isRoleModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2 leading-tight">تغيير رتبة المستخدم</h3>
                    <p className="text-gray-400 text-xs mb-6 font-medium">أنت الآن تقوم بتغيير صلاحيات <b>{selectedUser.name}</b></p>
                    
                    <div className="space-y-2">
                       {[
                         { id: "buyer", label: "مشتري (مستخدم عادي)", color: "text-blue-600 bg-blue-50" },
                         { id: "seller", label: "بائع (مقدم خدمات)", color: "text-green-600 bg-green-50" },
                         { id: "moderator", label: "مشرف (موديراتور)", color: "text-purple-600 bg-purple-50" },
                         { id: "admin", label: "مدير (أدمن)", color: "text-red-600 bg-red-50" },
                       ].map((role) => (
                         <button
                           key={role.id}
                           onClick={() => setSelectedRole(role.id)}
                           className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                             selectedRole === role.id 
                              ? "border-[#0D5D48] bg-[#0D5D48]/5 ring-2 ring-[#0D5D48]/10" 
                              : "border-gray-100 bg-white hover:bg-gray-50"
                           }`}
                         >
                           <span className={`text-xs font-bold ${role.id === selectedRole ? "text-[#0D5D48]" : "text-gray-500"}`}>{role.label}</span>
                           {selectedRole === role.id && <Check className="w-4 h-4 text-[#0D5D48]" />}
                         </button>
                       ))}
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button
                        disabled={updateRole.isPending}
                        onClick={() => updateRole.mutate({ userId: selectedUser.id, role: selectedRole })}
                        className="flex-1 bg-[#0D5D48] hover:bg-[#0A4A3A] rounded-xl h-12 font-bold"
                      >
                        {updateRole.isPending ? "جاري التحديث..." : "تطبيق الرتبة"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsRoleModalOpen(false)}
                        className="flex-1 h-12 rounded-xl text-gray-400 font-bold"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Deletion Modal */}
              {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2 leading-tight">حذف المستخدم نهائياً؟</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                       هل أنت متأكد من حذف <b>{selectedUser.name}</b>؟ هذا الإجراء سيقوم بحذف المحفظة والخدمات وكافة البيانات المرتبطة ولن يمكنك التراجع.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        disabled={deleteUser.isPending}
                        onClick={() => deleteUser.mutate({ userId: selectedUser.id })}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-red-200"
                      >
                        {deleteUser.isPending ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="h-12 rounded-xl text-gray-400 font-bold hover:text-gray-600"
                      >
                        إلغاء التراجع
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">كل الخدمات</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right">الخدمة</TableHead>
                      <TableHead className="text-right">البائع</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingServices?.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell><p className="font-bold text-sm line-clamp-1">{service.title}</p></TableCell>
                        <TableCell className="text-sm font-medium">{service.sellerName}</TableCell>
                        <TableCell className="text-sm font-black text-[#0D5D48]">{Number(service.price).toLocaleString()} ل.س</TableCell>
                        <TableCell>
                          <Badge className={`${service.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border-0 text-[10px]`}>
                            {service.status === 'active' ? 'نشط' : 'معطل/مرفوض'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {service.status !== 'active' ? (
                              <Button onClick={() => approveService.mutate({ id: service.id })} size="sm" className="bg-green-600 rounded-lg h-8 px-3 text-xs">تفعيل</Button>
                            ) : (
                              <Button onClick={() => rejectService.mutate({ id: service.id })} variant="destructive" size="sm" className="rounded-lg h-8 px-3 text-xs">تعطيل</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "withdrawals" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">طلبات السحب</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الوسيلة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals?.map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={w.userAvatar || ""} className="w-8 h-8 rounded-full" />
                            <span className="text-sm font-bold">{w.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-black text-red-600">{Number(w.amount).toLocaleString()} ل.س</TableCell>
                        <TableCell className="text-xs">{w.method} - {w.accountName} ({w.accountNumber})</TableCell>
                        <TableCell><Badge variant="outline">{w.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 h-8 text-[10px]" onClick={() => updateWithdrawal.mutate({ id: w.id, status: "approved" })}>قبول</Button>
                            <Button size="sm" variant="destructive" className="h-8 text-[10px]" onClick={() => updateWithdrawal.mutate({ id: w.id, status: "rejected" })}>رفض</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "deposits" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">طلبات الإيداع (شحن الرصيد)</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الوسيلة</TableHead>
                      <TableHead className="text-right">الرقم المرجعي</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits?.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell><span className="text-sm font-bold">{d.userName}</span></TableCell>
                        <TableCell className="text-sm font-black text-green-600">{Number(d.amount).toLocaleString()} ل.س</TableCell>
                        <TableCell className="text-xs">{d.method} {d.senderPhone && `(${d.senderPhone})`}</TableCell>
                        <TableCell className="text-xs font-mono">{d.transactionNumber}</TableCell>
                        <TableCell>
                          {d.status === "pending" ? (
                            <Button
                              size="sm"
                              className="bg-[#0D5D48] h-8 text-[10px]"
                              onClick={() => approveDeposit.mutate({ id: d.id, userId: d.userId, amount: d.amount })}
                            >
                              تأكيد الشحن
                            </Button>
                          ) : (
                            <Badge className="bg-green-50 text-green-600 border-0">تم القبول</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "disputes" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">إدارة النزاعات</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">الخدمة</TableHead>
                      <TableHead className="text-right">فاتح النزاع</TableHead>
                      <TableHead className="text-right">السبب</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes && disputes.length > 0 ? disputes.map((d: any) => (
                      <TableRow key={d.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div>
                            <p className="font-bold text-sm">{d.orderNumber}</p>
                            <p className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString("ar-SY")}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium line-clamp-1">{d.serviceTitle}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-bold">{d.openedByName}</p>
                            <p className="text-[10px] text-gray-400">{d.openedBy === d.buyerId ? "مشتري" : "بائع"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{d.reason}</TableCell>
                        <TableCell className="text-sm font-black text-[#0D5D48]">
                          {Number(d.escrowAmount || 0).toLocaleString()} ل.س
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            d.status === "open"
                              ? "bg-red-50 text-red-600 border-0"
                              : "bg-green-50 text-green-600 border-0"
                          }>
                            {d.status === "open" ? "مفتوح" : "محلول"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {d.status === "open" ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 rounded-lg h-8 px-3 text-[10px]"
                                onClick={() => resolveDispute.mutate({ id: d.id, decision: "buyer_favor" })}
                                disabled={resolveDispute.isPending}
                              >
                                لصالح المشتري
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 rounded-lg h-8 px-3 text-[10px]"
                                onClick={() => resolveDispute.mutate({ id: d.id, decision: "seller_favor" })}
                                disabled={resolveDispute.isPending}
                              >
                                لصالح البائع
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg h-8 px-3 text-[10px] text-gray-500"
                                onClick={() => resolveDispute.mutate({ id: d.id, decision: "cancelled" })}
                                disabled={resolveDispute.isPending}
                              >
                                إلغاء
                              </Button>
                            </div>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px]">
                              {d.decision === "buyer_favor" ? "لصالح المشتري" : d.decision === "seller_favor" ? "لصالح البائع" : "ملغى"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
                          <AlertTriangle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">لا توجد نزاعات</h3>
                          <p className="text-gray-400 text-sm">كل شيء يسير بسلاسة! لا توجد شكاوى أو نزاعات.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
