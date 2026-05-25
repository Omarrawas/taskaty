import { trpc } from "@/providers/trpc";
import CategoryCard from "@/components/cards/CategoryCard";

export default function CategoriesSection() {
  const { data: categories, isLoading } = trpc.categories.list.useQuery();

  return (
    <section className="py-20 bg-[#FAFBF7]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-[#1A1A2E] text-3xl font-bold mb-2">تصفح حسب التصنيف</h2>
          <p className="text-gray-500 text-base">اختر التصنيف المناسب وابحث عن الخدمة التي تحتاجها</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {(categories ?? []).map((cat, i) => (
              <div
                key={cat.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <CategoryCard
                  nameAr={cat.nameAr}
                  slug={cat.slug ?? ""}
                  icon={cat.icon ?? "Package"}
                  serviceCount={Number(cat.serviceCount ?? 0)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
