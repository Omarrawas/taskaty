import SellerCard from "@/components/cards/SellerCard";
import { trpc } from "@/providers/trpc";

export default function TopSellers() {
  const { data: sellers, isLoading } = trpc.sellers.list.useQuery({ limit: 4 });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-[#1A1A2E] text-3xl font-bold">أفضل البائعين</h2>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(sellers ?? []).map((seller, i) => (
              <div
                key={seller.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                <SellerCard
                  id={seller.id}
                  name={seller.name}
                  avatar={seller.avatar ?? ""}
                  levelLabel={(seller as any).level ?? "بائع جديد"}
                  rating={seller.rating ?? "0"}
                  totalOrders={seller.totalOrders ?? 0}
                  responseTime={(seller as any).responseTime ?? "ساعة"}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
