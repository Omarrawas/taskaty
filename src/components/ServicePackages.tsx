import { useState } from "react";
import { Check, Crown, Zap, Star, Clock, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Package {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  popular?: boolean;
}

interface ServicePackagesProps {
  packages: Package[];
  onSelect: (pkg: Package) => void;
  selectedPackageId?: string;
}

const packageIcons: Record<string, typeof Star> = {
  basic: Star,
  standard: Zap,
  premium: Crown,
};

const packageColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  basic: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    badge: "bg-gray-100 text-gray-600",
  },
  standard: {
    bg: "bg-[#E8F5F0]",
    border: "border-[#0D5D48]",
    text: "text-[#0D5D48]",
    badge: "bg-[#0D5D48] text-white",
  },
  premium: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-amber-500 text-white",
  },
};

export default function ServicePackages({ packages, onSelect, selectedPackageId }: ServicePackagesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">اختر الباقة المناسبة</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const Icon = packageIcons[pkg.id] || Star;
          const colors = packageColors[pkg.id] || packageColors.basic;
          const isSelected = selectedPackageId === pkg.id;
          const isHovered = hoveredId === pkg.id;

          return (
            <div
              key={pkg.id}
              onMouseEnter={() => setHoveredId(pkg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${colors.bg} ${colors.border} shadow-lg scale-[1.02]`
                  : `bg-white border-gray-200 hover:${colors.border} hover:shadow-md`
              }`}
              onClick={() => onSelect(pkg)}
            >
              {pkg.popular && (
                <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.badge} text-xs px-3 py-1`}>
                  الأكثر طلباً
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div>
                  <h4 className={`font-bold ${colors.text}`}>{pkg.nameAr}</h4>
                  <p className="text-xs text-gray-500">{pkg.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${colors.text}`}>
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">ل.س</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>تسليم خلال <strong>{pkg.deliveryTime} أيام</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RefreshCcw className="w-4 h-4 text-gray-400" />
                  <span><strong>{pkg.revisions}</strong> تعديلات</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-xl h-11 font-bold transition-all ${
                  isSelected
                    ? `${colors.badge} hover:opacity-90`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isSelected ? "محدد" : "اختيار الباقة"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Default packages for services that don't have custom packages
export const defaultPackages: Package[] = [
  {
    id: "basic",
    name: "Basic",
    nameAr: "أساسية",
    description: "للطلبات البسيطة",
    price: 0,
    deliveryTime: 3,
    revisions: 1,
    features: [
      "تصميم أساسي",
      "ملف واحد",
      "تسليم خلال 3 أيام",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    nameAr: "قياسية",
    description: "للطلبات المتوسطة",
    price: 0,
    deliveryTime: 5,
    revisions: 2,
    features: [
      "تصميم احترافي",
      "3 ملفات",
      "تسليم خلال 5 أيام",
      "تعديلات إضافية",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    nameAr: "مميزة",
    description: "للطلبات الكاملة",
    price: 0,
    deliveryTime: 7,
    revisions: -1,
    features: [
      "تصميم حصري",
      "ملفات غير محدودة",
      "تسليم خلال 7 أيام",
      "تعديلات غير محدودة",
      "دعم فني أولوي",
    ],
  },
];
