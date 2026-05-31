import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  LayoutDashboard, ShoppingBag, Wallet, MessageCircle, Bell, User, Settings,
  ChevronLeft, ArrowUpRight, Eye, Package, Plus, CheckCircle2, PauseCircle, Heart, Gift, Menu, X, Image as ImageIcon, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { statusLabels, statusColors, transactionTypeLabels, transactionTypeColors } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

import { useChat } from "@/hooks/useChat";
import { WalletModals } from "@/components/dashboard/WalletModals";
import NotificationsTab from "./NotificationsTab";
import ProfileTab from "./ProfileTab";
import SettingsTab from "./SettingsTab";
import FavoritesTab from "./FavoritesTab";
import ReferralsTab from "./ReferralsTab";
import { uploadServiceImage, getServiceImage } from "@/lib/storage";

const baseSidebarItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", value: "dashboard" },
  { icon: ShoppingBag, label: "طلباتي", value: "orders" },
  { icon: Heart, label: "المفضلة", value: "favorites" },
  { icon: Wallet, label: "محفظتي", value: "wallet" },
  { icon: MessageCircle, label: "محادثاتي", value: "chat" },
  { icon: Bell, label: "الإشعارات", value: "notifications" },
  { icon: Gift, label: "الدعوات", value: "referrals" },
  { icon: User, label: "الملف الشخصي", value: "profile" },
  { icon: Settings, label: "الإعدادات", value: "settings" },
];

const sellerSidebarItems = [
  { icon: Package, label: "خدماتي", value: "seller-services" },
  { icon: CheckCircle2, label: "مبيعاتي", value: "sales" },
];

const emptyServiceForm = {
  title: "",
  description: "",
  price: "",
  deliveryTime: "3",
  categoryId: "",
  tags: "",
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [walletAction, setWalletAction] = useState<"deposit" | "withdraw" | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [serviceImage, setServiceImage] = useState<string | null>(null);
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const serviceImageInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  useEffect(() => {
    const tab = searchParams.get("tab");
    const action = searchParams.get("action");
    
    if (tab) setActiveTab(tab);
    if (action === "deposit") setWalletAction("deposit");
    if (action === "withdraw") setWalletAction("withdraw");
  }, [searchParams]);

  // Data fetching
  const { data: walletData } = trpc.wallet.balance.useQuery(undefined, { enabled: !!user });
  const { data: ordersData } = trpc.orders.list.useQuery({ role: "buyer" }, { enabled: !!user });
  const { data: sellerOrdersData } = trpc.orders.list.useQuery({ role: "seller" }, { enabled: !!user && (user?.role === "seller" || user?.role === "admin") });
  const { data: transactionsData } = trpc.wallet.transactions.useQuery({ limit: 10 }, { enabled: !!user });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: sellerServices } = trpc.services.bySeller.useQuery(
    { sellerId: user?.unionId || user?.id || "" },
    { enabled: !!user && (user?.role === "seller" || user?.role === "admin") },
  );
  const { conversations } = useChat();
  const balance = parseFloat(walletData?.balance ?? "0");
  const orders = ordersData ?? [];
  const sellerOrders = sellerOrdersData ?? [];
  const isSeller = user?.role === "seller" || user?.role === "admin";
  const activeOrders = orders.filter((o: any) => o.status === "in_progress" || o.status === "pending" || o.status === "revision");
  const activeSellerOrders = sellerOrders.filter((o: any) => o.status === "in_progress" || o.status === "pending" || o.status === "revision" || o.status === "delivered");
  const walletTransactions = transactionsData ?? [];
  const sidebarItems = isSeller
    ? [...baseSidebarItems.slice(0, 2), ...sellerSidebarItems, ...baseSidebarItems.slice(2)]
    : baseSidebarItems;

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: async () => {
      toast.success("تم إرسال الخدمة للمراجعة بنجاح");
      setServiceForm(emptyServiceForm);
      setServiceImage(null);
      await utils.services.bySeller.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في إضافة الخدمة");
    },
  });

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث الخدمة بنجاح");
      await utils.services.bySeller.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في تحديث الخدمة");
    },
  });

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: async () => {
      toast.success("تم حذف الخدمة بنجاح");
      await utils.services.bySeller.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في حذف الخدمة");
    },
  });

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.orders.list.invalidate();
      await utils.wallet.balance.invalidate();
      await utils.wallet.transactions.invalidate();
    },
  });

  const submitService = () => {
    createServiceMutation.mutate({
      title: serviceForm.title,
      description: serviceForm.description,
      price: serviceForm.price,
      deliveryTime: Number(serviceForm.deliveryTime),
      categoryId: serviceForm.categoryId,
      tags: serviceForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      images: serviceImage ? [serviceImage] : [],
    });
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setServiceImageUploading(true);
    try {
      const base64 = await uploadServiceImage(file);
      setServiceImage(base64);
    } catch (err: any) {
      toast.error(err.message || "فشل في رفع الصورة");
    } finally {
      setServiceImageUploading(false);
      if (serviceImageInputRef.current) serviceImageInputRef.current.value = "";
    }
  };


  const stats = [
    { label: "رصيد المحفظة", value: `${balance.toLocaleString()} ل.س`, trend: 0, icon: Wallet, color: "bg-[#E8F5F0] text-[#0D5D48]" },
    { label: isSeller ? "مبيعات نشطة" : "طلباتي", value: (isSeller ? sellerOrders.length : orders.length).toString(), sub: `${isSeller ? activeSellerOrders.length : activeOrders.length} نشط`, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "محادثات", value: conversations.length.toString(), sub: "متاح الآن", icon: MessageCircle, color: "bg-purple-50 text-purple-600" },
    { label: "إشعارات", value: "0", sub: "قريباً", icon: Bell, color: "bg-amber-50 text-amber-600" },
  ];

  const mobileNavItems = sidebarItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />
      
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5DF] z-40 px-2 py-2">
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
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A2E]">القائمة</h3>
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
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-[#E8F5F0] text-[#0D5D48]"
                >
                  <Settings className="w-5 h-5" />
                  لوحة الإدارة
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-[72px] flex pb-20 lg:pb-0">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-l border-[#E5E5DF] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-[#E8F5F0]"
              />
              <div>
                <p className="font-semibold text-[#1A1A2E] truncate w-32">{user?.name || "مستكشف"}</p>
                <Badge variant="secondary" className="text-[10px] py-0">
                  {user?.role === "admin" ? "مدير" : user?.role === "seller" ? "بائع" : user?.role === "moderator" ? "مشرف" : "مشتري"}
                </Badge>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-right ${
                    activeTab === item.value
                      ? "bg-[#0D5D48] text-white shadow-md shadow-[#0D5D48]/20"
                      : "text-gray-600 hover:bg-[#E8F5F0] hover:text-[#0D5D48]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-[#E5E5DF] space-y-3">
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm font-bold text-white bg-[#0D5D48] hover:bg-[#094533] transition-colors px-4 py-3 rounded-xl"
                >
                  <span className="text-base">⚙️</span>
                  لوحة الإدارة
                </Link>
              )}
              <Link to="/" className="text-sm text-gray-500 hover:text-[#0D5D48] transition-colors flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                العودة للموقع
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">مرحباً، {user?.name} 👋</h2>
                <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString("ar-SY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      {typeof stat.trend === 'number' && stat.trend > 0 && (
                        <span className="text-xs text-green-600 flex items-center gap-0.5 font-medium">
                          <ArrowUpRight className="w-3 h-3" /> +{stat.trend}%
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A2E]">{stat.value}</p>
                    {stat.sub && <p className="text-[10px] text-gray-400 mt-1">{stat.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Active Orders */}
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">طلباتي النشطة</h3>
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden mb-8">
                {activeOrders.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {activeOrders.map((order: any) => {
                      const colors = statusColors[order.status as keyof typeof statusColors] || statusColors.pending;
                      return (
                        <div key={`active-order-${order.id}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-gray-400">{order.orderNumber}</span>
                              <Badge className={`${colors.bg} ${colors.text} border-0 text-[10px] px-2 py-0`}>
                                {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-[#1A1A2E] line-clamp-1">{order.serviceTitle}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{order.buyerName} | {new Date(order.createdAt).toLocaleDateString("ar-SY")}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-[#0D5D48] whitespace-nowrap">{parseFloat(order.totalAmount).toLocaleString()} ل.س</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="rounded-xl text-xs h-9 border-[#E5E5DF]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">لا توجد طلبات نشطة في الوقت الحالي</p>
                    <Link to="/services">
                      <Button variant="link" className="text-[#0D5D48] text-xs underline">تصفح الخدمات المتوفرة</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">طلباتي</h2>
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-right text-xs">رقم الطلب</TableHead>
                      <TableHead className="text-right text-xs">الخدمة</TableHead>
                      <TableHead className="text-right text-xs">الحالة</TableHead>
                      <TableHead className="text-right text-xs">المبلغ</TableHead>
                      <TableHead className="text-right text-xs">التاريخ</TableHead>
                      <TableHead className="text-right text-xs">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? orders.map((order: any) => {
                      const colors = statusColors[order.status as keyof typeof statusColors] || statusColors.pending;
                      return (
                        <TableRow key={`order-${order.id}`} className="hover:bg-gray-50/50">
  <TableCell className="text-xs font-mono">{order.orderNumber}</TableCell>
                          <TableCell className="text-sm font-medium">{order.serviceTitle}</TableCell>
                          <TableCell>
                            <Badge className={`${colors.bg} ${colors.text} border-0 text-[10px] px-2 py-0`}>
                              {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-[#0D5D48]">
                            {parseFloat(order.totalAmount).toLocaleString()} ل.س
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("ar-SY")}</TableCell>
                          <TableCell>
                            {order.status === "delivered" ? (
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "completed" })} className="rounded-xl h-8 text-xs bg-[#0D5D48]">
                                  قبول التسليم
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "revision" })} className="rounded-xl h-8 text-xs border-[#E5E5DF]">
                                  تعديل
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)} className="rounded-xl h-8 text-xs border-[#E5E5DF]">
                                عرض
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400 text-sm">لا توجد سجلات طلبات</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Seller Services Tab */}
          {activeTab === "seller-services" && isSeller && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E]">خدماتي</h2>
                  <p className="text-sm text-gray-500 mt-1">أنشئ خدمات جديدة وتابع حالة مراجعتها من الإدارة.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 p-5 mb-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#0D5D48]" />
                  إضافة خدمة
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عنوان الخدمة</Label>
                    <Input value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="rounded-xl h-11 border-[#E5E5DF]" />
                  </div>
                  <div className="space-y-2">
                    <Label>التصنيف</Label>
                    <Select value={serviceForm.categoryId} onValueChange={(value) => setServiceForm({ ...serviceForm, categoryId: value })}>
                      <SelectTrigger className="rounded-xl h-11 border-[#E5E5DF]">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((category: any) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.nameAr || category.name || category.slug}
                          </SelectItem>
                        ))}
                        {(categories ?? []).length === 0 && (
                          <SelectItem value="general">خدمات عامة</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>السعر (ل.س)</Label>
                    <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="rounded-xl h-11 border-[#E5E5DF]" />
                  </div>
                  <div className="space-y-2">
                    <Label>مدة التسليم بالأيام</Label>
                    <Input type="number" min={1} value={serviceForm.deliveryTime} onChange={(e) => setServiceForm({ ...serviceForm, deliveryTime: e.target.value })} className="rounded-xl h-11 border-[#E5E5DF]" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>الوصف</Label>
                    <Textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="rounded-xl min-h-28 border-[#E5E5DF]" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>وسوم مفصولة بفواصل</Label>
                    <Input value={serviceForm.tags} onChange={(e) => setServiceForm({ ...serviceForm, tags: e.target.value })} className="rounded-xl h-11 border-[#E5E5DF]" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>صورة الخدمة (اختياري)</Label>
                    <input
                      ref={serviceImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleServiceImageUpload}
                      className="hidden"
                    />
                    {serviceImage ? (
                      <div className="relative w-full max-w-xs">
                        <img src={serviceImage} alt="صورة الخدمة" className="w-40 h-28 object-cover rounded-xl border border-[#E5E5DF]" />
                        <button
                          onClick={() => setServiceImage(null)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => serviceImageInputRef.current?.click()}
                        disabled={serviceImageUploading}
                        className="w-full max-w-xs h-28 border-2 border-dashed border-[#E5E5DF] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0D5D48] hover:bg-[#E8F5F0]/30 transition-colors"
                      >
                        {serviceImageUploading ? (
                          <Loader2 className="w-6 h-6 text-[#0D5D48] animate-spin" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {serviceImageUploading ? "جاري الرفع..." : "اضغط لرفع صورة"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  onClick={submitService}
                  disabled={createServiceMutation.isPending || !serviceForm.title || !serviceForm.description || !serviceForm.price || !serviceForm.categoryId}
                  className="mt-5 bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8"
                >
                  {createServiceMutation.isPending ? "جاري الإرسال..." : "إرسال للمراجعة"}
                </Button>
                {createServiceMutation.error && <p className="text-sm text-red-600 mt-3">{createServiceMutation.error.message}</p>}
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-right text-xs">الخدمة</TableHead>
                      <TableHead className="text-right text-xs">السعر</TableHead>
                      <TableHead className="text-right text-xs">الحالة</TableHead>
                      <TableHead className="text-right text-xs">الطلبات</TableHead>
                      <TableHead className="text-right text-xs">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(sellerServices ?? []).length > 0 ? (sellerServices ?? []).map((service: any) => (
                      <TableRow key={`seller-service-${service.id}`} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={getServiceImage(service.images, service.categorySlug)} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E5E5DF] shrink-0" />
                            <div>
                              <div className="font-bold text-sm text-[#1A1A2E] line-clamp-1">{service.title}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{new Date(service.createdAt).toLocaleDateString("ar-SY")}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-[#0D5D48]">{parseFloat(service.price || "0").toLocaleString()} ل.س</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px] px-2 py-0">
                            {service.status === "active" ? "نشطة" : service.status === "paused" ? "متوقفة" : service.status === "rejected" ? "مرفوضة" : "بانتظار المراجعة"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{service.totalOrders ?? 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {service.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateServiceMutation.mutate({ id: service.id, status: "paused" })}
                                className="rounded-xl text-xs h-8 border-[#E5E5DF]"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                                إيقاف
                              </Button>
                            )}
                            {service.status === "paused" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateServiceMutation.mutate({ id: service.id, status: "pending" })}
                                className="rounded-xl text-xs h-8 border-[#E5E5DF]"
                              >
                                مراجعة
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteServiceMutation.mutate({ id: service.id })}
                              className="rounded-xl text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 text-sm">لم تضف خدمات بعد</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Seller Sales Tab */}
          {activeTab === "sales" && isSeller && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">مبيعاتي</h2>
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-right text-xs">رقم الطلب</TableHead>
                      <TableHead className="text-right text-xs">الخدمة</TableHead>
                      <TableHead className="text-right text-xs">المشتري</TableHead>
                      <TableHead className="text-right text-xs">الحالة</TableHead>
                      <TableHead className="text-right text-xs">الأرباح</TableHead>
                      <TableHead className="text-right text-xs">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellerOrders.length > 0 ? sellerOrders.map((order: any) => {
                      const colors = statusColors[order.status as keyof typeof statusColors] || statusColors.pending;
                      return (
                        <TableRow key={`sale-${order.id}`} className="hover:bg-gray-50/50">
                          <TableCell className="text-xs font-mono">{order.orderNumber}</TableCell>
                          <TableCell className="text-sm font-medium">{order.serviceTitle}</TableCell>
                          <TableCell className="text-xs text-gray-500">{order.buyerName || "مشتري"}</TableCell>
                          <TableCell>
                            <Badge className={`${colors.bg} ${colors.text} border-0 text-[10px] px-2 py-0`}>
                              {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-[#0D5D48]">{parseFloat(order.totalAmount).toLocaleString()} ل.س</TableCell>
                          <TableCell>
                            {order.status === "pending" || order.status === "revision" ? (
                              <Button size="sm" onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "in_progress" })} className="rounded-xl h-8 text-xs bg-[#0D5D48]">
                                بدء العمل
                              </Button>
                            ) : order.status === "in_progress" ? (
                              <Button size="sm" onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "delivered" })} className="rounded-xl h-8 text-xs bg-[#0D5D48]">
                                تسليم
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)} className="rounded-xl h-8 text-xs border-[#E5E5DF]">
                                عرض
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400 text-sm">لا توجد مبيعات بعد</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">محفظتي</h2>

              <div className="bg-gradient-to-br from-[#0D5D48] to-[#094533] rounded-3xl p-10 text-white mb-8 text-center shadow-xl shadow-[#0D5D48]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-3">الرصيد القابل للسحب</p>
                <div className="flex items-baseline justify-center gap-2 mb-8">
                  <p className="text-5xl font-extrabold">{balance.toLocaleString()}</p>
                  <span className="text-xl font-medium opacity-80">ل.س</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => setWalletAction("deposit")}
                    className="bg-white text-[#0D5D48] hover:bg-gray-100 rounded-2xl px-8 h-12 font-bold shadow-lg shadow-black/10 transition-transform active:scale-95"
                  >
                    إيداع رصيد
                  </Button>
                  <Button 
                    onClick={() => setWalletAction("withdraw")}
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-8 h-12 font-bold backdrop-blur-sm transition-transform active:scale-95"
                  >
                    طلب سحب
                  </Button>
                </div>
              </div>

              <WalletModals 
                type={walletAction} 
                onClose={() => setWalletAction(null)}
                onSuccess={async () => {
                  await utils.wallet.balance.invalidate();
                  await utils.wallet.transactions.invalidate();
                }}
                balance={balance}
              />

              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">سجل العمليات</h3>
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-right text-xs">التاريخ</TableHead>
                      <TableHead className="text-right text-xs">النوع</TableHead>
                      <TableHead className="text-right text-xs">المبلغ</TableHead>
                      <TableHead className="text-right text-xs">الرصيد بعد</TableHead>
                      <TableHead className="text-right text-xs">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletTransactions.length > 0 ? walletTransactions.map((tx: any) => (
                      <TableRow key={`tx-${tx.id}`} className="hover:bg-gray-50/50">
                        <TableCell className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString("ar-SY")}</TableCell>
                        <TableCell className={`text-xs font-bold ${transactionTypeColors[tx.type as keyof typeof transactionTypeColors] || ""}`}>
                          {transactionTypeLabels[tx.type as keyof typeof transactionTypeLabels] || tx.type}
                        </TableCell>
                        <TableCell className={`text-sm font-extrabold ${parseFloat(tx.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {parseFloat(tx.amount) >= 0 ? "+" : ""}{parseFloat(tx.amount).toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className="text-sm font-medium">{parseFloat(tx.balanceAfter || "0").toLocaleString()} ل.س</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[tx.status as keyof typeof statusColors]?.bg || "bg-gray-50"} ${statusColors[tx.status as keyof typeof statusColors]?.text || "text-gray-600"} border-0 text-[10px] px-2 py-0`}>
                            {statusLabels[tx.status as keyof typeof statusLabels] || tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 text-sm">لا توجد عمليات سابقة</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">محادثاتي</h2>
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden divide-y divide-gray-100">
                {conversations.length > 0 ? conversations.map((conv) => (
                  <div key={`conv-${conv.id}`} className="p-5 flex items-center gap-4 hover:bg-[#FAFBF7] transition-all cursor-pointer group">
                    <div className="relative">
                      <img src={conv.otherAvatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${conv.otherName}`} alt={conv.otherName} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      {(conv as any).unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                          {(conv as any).unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#1A1A2E] text-base">{conv.otherName}</h4>
                        <span className="text-[10px] text-gray-400">{new Date(conv.lastMessageAt || "").toLocaleTimeString("ar-SY", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 italic">"{conv.lastMessage || "بدء محادثة جديدة..."}"</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20">
                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">ليس لديك محادثات نشطة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <NotificationsTab />
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <FavoritesTab />
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <ReferralsTab />
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <ProfileTab />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <SettingsTab />
          )}
        </main>
      </div>
    </div>
  );
}
