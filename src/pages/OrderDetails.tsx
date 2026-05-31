import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Star,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { statusColors, statusLabels } from "@/lib/mockData";
import OpenDisputeDialog from "@/components/disputes/OpenDisputeDialog";
import { ChatDialog } from "@/components/chat/ChatDialog";

function formatCurrency(value: string | number | undefined) {
  return `${parseFloat(String(value ?? "0")).toLocaleString()} ل.س`;
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "غير محدد";
  return new Date(value).toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrderDetails() {
  const { id = "" } = useParams();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const [note, setNote] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: order, isLoading, error } = trpc.orders.byId.useQuery({ id }, { enabled: !!id && !!user }) as any;
  const { data: myReview } = trpc.reviews.byOrderForMe.useQuery(
    { orderId: id },
    { enabled: !!id && !!user },
  ) as any;

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: async () => {
      setNote("");
      await utils.orders.byId.invalidate({ id });
      await utils.orders.list.invalidate();
      await utils.wallet.balance.invalidate();
      await utils.wallet.transactions.invalidate();
    },
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: async () => {
      setReviewComment("");
      await utils.reviews.byOrderForMe.invalidate({ orderId: id });
      await utils.reviews.bySeller.invalidate();
      if (order?.serviceId) {
        await utils.reviews.byService.invalidate({ serviceId: order.serviceId });
      }
    },
  });

  const role = useMemo(() => {
    if (!order || !user) return null;
    const userId = user.unionId || user.id;
    if (order.buyerId === userId) return "buyer";
    if (order.sellerId === userId) return "seller";
    return null;
  }, [order, user]);

  const statusStyle = statusColors[order?.status as keyof typeof statusColors] || statusColors.pending;
  const receiverId = role === "seller" ? order?.buyerId : order?.sellerId;
  const receiverName = role === "seller" ? (order?.buyerName || "المشتري") : (order?.sellerName || "البائع");

  const runAction = (status: "in_progress" | "delivered" | "revision" | "completed" | "cancelled") => {
    updateStatus.mutate({ id, status, note: note.trim() || undefined });
  };

  const submitReview = () => {
    if (!order || role !== "buyer") return;
    createReview.mutate({
      orderId: id,
      revieweeId: order.sellerId,
      rating,
      comment: reviewComment.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#0D5D48] mb-6">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>

        {isLoading && (
          <div className="bg-white border border-[#E5E5DF] rounded-2xl p-10 text-center text-gray-500">
            جاري تحميل الطلب...
          </div>
        )}

        {error && (
          <div className="bg-white border border-red-100 rounded-2xl p-10 text-center text-red-600">
            {error.message}
          </div>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <section className="space-y-6">
              <div className="bg-white border border-[#E5E5DF]/70 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-mono text-gray-400 mb-2">{order.orderNumber}</p>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] leading-snug">{order.serviceTitle}</h1>
                  </div>
                  <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 px-3 py-1 rounded-lg`}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#FAFBF7] rounded-xl p-4 border border-[#E5E5DF]/70">
                    <p className="text-xs text-gray-500 mb-1">المبلغ المحجوز</p>
                    <p className="text-lg font-black text-[#0D5D48]">{formatCurrency(order.escrowAmount || order.totalAmount)}</p>
                  </div>
                  <div className="bg-[#FAFBF7] rounded-xl p-4 border border-[#E5E5DF]/70">
                    <p className="text-xs text-gray-500 mb-1">تاريخ الطلب</p>
                    <p className="text-sm font-bold text-[#1A1A2E]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="bg-[#FAFBF7] rounded-xl p-4 border border-[#E5E5DF]/70">
                    <p className="text-xs text-gray-500 mb-1">موعد التسليم</p>
                    <p className="text-sm font-bold text-[#1A1A2E]">{formatDate(order.deliveryDate)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E5DF]/70 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-black text-[#1A1A2E] mb-4">متطلبات المشتري</h2>
                <p className="text-sm leading-7 text-gray-600 whitespace-pre-wrap">
                  {order.requirements || "لم يكتب المشتري متطلبات تفصيلية لهذا الطلب."}
                </p>
              </div>

              {(order.deliveryNote || order.revisionNote) && (
                <div className="bg-white border border-[#E5E5DF]/70 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                  {order.deliveryNote && (
                    <div className="mb-5 last:mb-0">
                      <h2 className="text-lg font-black text-[#1A1A2E] mb-3">رسالة التسليم</h2>
                      <p className="text-sm leading-7 text-gray-600 whitespace-pre-wrap">{order.deliveryNote}</p>
                    </div>
                  )}
                  {order.revisionNote && (
                    <div>
                      <h2 className="text-lg font-black text-[#1A1A2E] mb-3">ملاحظات التعديل</h2>
                      <p className="text-sm leading-7 text-gray-600 whitespace-pre-wrap">{order.revisionNote}</p>
                    </div>
                  )}
                </div>
              )}

              {order.status === "completed" && role === "buyer" && (
                <div className="bg-white border border-[#E5E5DF]/70 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-black text-[#1A1A2E] mb-4">تقييم البائع</h2>
                  {myReview ? (
                    <div className="bg-[#FAFBF7] border border-[#E5E5DF]/70 rounded-xl p-4">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`saved-star-${index}`}
                            className={`w-5 h-5 ${index < myReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm leading-7 text-gray-600 whitespace-pre-wrap">
                        {myReview.comment || "تم تقييم هذا الطلب بدون تعليق."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const value = index + 1;
                          return (
                            <button
                              key={`star-${value}`}
                              type="button"
                              onClick={() => setRating(value)}
                              className="p-1 rounded-md hover:bg-amber-50 transition-colors"
                              aria-label={`تقييم ${value}`}
                            >
                              <Star className={`w-7 h-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                            </button>
                          );
                        })}
                      </div>
                      <Textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        className="rounded-xl min-h-28 border-[#E5E5DF]"
                        placeholder="اكتب رأيك في جودة العمل والتواصل والالتزام..."
                      />
                      <Button
                        onClick={submitReview}
                        disabled={createReview.isPending}
                        className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8"
                      >
                        {createReview.isPending ? "جاري الحفظ..." : "إرسال التقييم"}
                      </Button>
                      {createReview.error && <p className="text-sm text-red-600">{createReview.error.message}</p>}
                    </div>
                  )}
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="bg-white border border-[#E5E5DF]/70 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="text-lg font-black text-[#1A1A2E] mb-4">إدارة الطلب</h2>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">دورك</span>
                    <span className="font-bold text-[#1A1A2E]">{role === "seller" ? "بائع" : "مشتري"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">المشتري</span>
                    <span className="font-bold text-[#1A1A2E]">{order.buyerName || "مشتري"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">البائع</span>
                    <span className="font-bold text-[#1A1A2E]">{order.sellerName || order.sellerId}</span>
                  </div>
                </div>

                {(order.status === "in_progress" || order.status === "delivered") && (
                  <div className="space-y-2 mb-4">
                    <label className="text-xs font-bold text-gray-500">
                      {role === "seller" ? "ملاحظة التسليم" : "ملاحظة التعديل"}
                    </label>
                    <Textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="rounded-xl min-h-24 border-[#E5E5DF]"
                      placeholder={role === "seller" ? "أضف روابط أو تفاصيل التسليم..." : "اكتب المطلوب تعديله..."}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {role === "seller" && (order.status === "pending" || order.status === "revision") && (
                    <Button onClick={() => runAction("in_progress")} disabled={updateStatus.isPending} className="w-full bg-[#0D5D48] rounded-xl h-11">
                      <Clock className="w-4 h-4" />
                      بدء العمل
                    </Button>
                  )}
                  {role === "seller" && order.status === "in_progress" && (
                    <Button onClick={() => runAction("delivered")} disabled={updateStatus.isPending} className="w-full bg-[#0D5D48] rounded-xl h-11">
                      <PackageCheck className="w-4 h-4" />
                      تسليم الطلب
                    </Button>
                  )}
                  {role === "buyer" && order.status === "delivered" && (
                    <>
                      <Button onClick={() => runAction("completed")} disabled={updateStatus.isPending} className="w-full bg-[#0D5D48] rounded-xl h-11">
                        <CheckCircle2 className="w-4 h-4" />
                        قبول التسليم وتحرير الأرباح
                      </Button>
                      <Button onClick={() => runAction("revision")} disabled={updateStatus.isPending} variant="outline" className="w-full rounded-xl h-11 border-[#E5E5DF]">
                        <RotateCcw className="w-4 h-4" />
                        طلب تعديل
                      </Button>
                    </>
                  )}
                  {(order.status === "pending" || order.status === "in_progress") && (
                    <Button onClick={() => runAction("cancelled")} disabled={updateStatus.isPending} variant="ghost" className="w-full rounded-xl h-11 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <XCircle className="w-4 h-4" />
                      إلغاء الطلب
                    </Button>
                  )}
                  {(order.status === "in_progress" || order.status === "delivered" || order.status === "revision") && !order.hasDispute && (
                    <Button onClick={() => setDisputeOpen(true)} variant="outline" className="w-full rounded-xl h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      فتح نزاع
                    </Button>
                  )}
                  {order.hasDispute && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-red-600">هذا الطلب عليه نزاع مفتوح</p>
                    </div>
                  )}
                  <Button onClick={() => setChatOpen(true)} variant="outline" className="w-full rounded-xl h-11 border-[#E5E5DF]">
                    <MessageCircle className="w-4 h-4" />
                    مراسلة {receiverName}
                  </Button>
                </div>

                {updateStatus.error && <p className="text-sm text-red-600 mt-4">{updateStatus.error.message}</p>}
              </div>

              <div className="bg-[#E8F5F0] border border-[#CFE8DE] rounded-2xl p-5 text-[#0D5D48]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 mt-0.5" />
                  <p className="text-sm leading-7 font-medium">
                    يبقى مبلغ الطلب محجوزًا حتى يقبل المشتري التسليم، وبعدها ينتقل الرصيد لمحفظة البائع.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {order && receiverId && (
        <ChatDialog
          isOpen={chatOpen}
          onOpenChange={setChatOpen}
          receiverUnionId={receiverId}
          receiverName={receiverName}
        />
      )}

      {order && (
        <OpenDisputeDialog
          isOpen={disputeOpen}
          onOpenChange={setDisputeOpen}
          orderId={id}
          orderNumber={order.orderNumber}
        />
      )}
    </div>
  );
}
