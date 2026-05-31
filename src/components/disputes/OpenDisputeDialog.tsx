import { useState } from "react";
import { AlertTriangle, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface OpenDisputeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
}

const disputeReasons = [
  "البائع لم يسلّم العمل",
  "جودة العمل غير مرضية",
  "البائع تأخر عن موعد التسليم",
  "العمل لا يطابق الوصف",
  "البائع غير متاح للمراجعة",
  "مشكلة في الدفع",
  "أخرى",
];

export default function OpenDisputeDialog({ isOpen, onOpenChange, orderId, orderNumber }: OpenDisputeDialogProps) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const createDispute = trpc.disputes.create.useMutation({
    onSuccess: async () => {
      toast.success("تم فتح النزاع بنجاح");
      setReason("");
      setCustomReason("");
      setDescription("");
      onOpenChange(false);
      await utils.disputes.myDisputes.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في فتح النزاع");
    },
  });

  const handleSubmit = () => {
    const finalReason = reason === "أخرى" ? customReason : reason;
    if (!finalReason || finalReason.length < 3) {
      toast.error("يرجى إدخال سبب النزاع");
      return;
    }
    if (!description || description.length < 10) {
      toast.error("يرجى كتابة وصف تفصيلي للنزاع (10 أحرف على الأقل)");
      return;
    }

    createDispute.mutate({
      orderId,
      reason: finalReason,
      description,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-8 py-6 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E]">فتح نزاع</h3>
                <p className="text-xs text-gray-500">الطلب: {orderNumber}</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>تنبيه:</strong> فتح نزاع يعني أن المبلغ المحجوز سيبقى معلقاً حتى يتخذ الإدارة قرارها. يُنصح التواصل مع الطرف الآخر أولاً.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#1A1A2E]">سبب النزاع</Label>
            <div className="grid grid-cols-2 gap-2">
              {disputeReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`p-3 rounded-xl border text-sm font-medium text-right transition-all ${
                    reason === r
                      ? "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-400/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === "أخرى" && (
              <Input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="اكتب السبب..."
                className="rounded-xl h-11 border-[#E5E5DF] mt-2"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#1A1A2E]">وصف المشكلة</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً للمشكلة التي واجهتك..."
              className="rounded-xl min-h-28 border-[#E5E5DF]"
            />
          </div>

          {/* Evidence Section */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-[#1A1A2E]">أدلة إضافية (اختياري)</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0D5D48] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">اسحب الملفات هنا أو اضغط للتحميل</p>
              <p className="text-xs text-gray-400 mt-1">الصور، لقطات شاشة، مستندات (قريباً)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl border-[#E5E5DF] font-bold"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createDispute.isPending || !reason || !description}
            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200"
          >
            {createDispute.isPending ? "جاري الإرسال..." : "فتح النزاع"}
          </Button>
        </div>

        {createDispute.error && (
          <div className="px-8 pb-4">
            <p className="text-sm text-red-600">{createDispute.error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
