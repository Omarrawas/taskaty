import { Link } from "react-router";
import { Heart, Star, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function FavoritesTab() {
  const utils = trpc.useUtils();

  const { data: favorites, isLoading } = trpc.favorites.list.useQuery();

  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: async () => {
      toast.success("تم الإزالة من المفضلة");
      await utils.favorites.list.invalidate();
      await utils.favorites.count.invalidate();
    },
  });

  const handleRemove = (serviceId: string) => {
    removeFavorite.mutate({ serviceId });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">المفضلة</h2>
          <p className="text-sm text-gray-500 mt-1">
            {favorites?.length || 0} خدمات محفوظة
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {favorites.map((fav: any) => (
              <div
                key={fav.id}
                className="group relative bg-white rounded-xl border border-[#E5E5DF]/50 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image */}
                <Link to={`/services/${fav.serviceSlug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={fav.serviceImage || "/images/design.jpg"}
                      alt={fav.serviceTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/services/${fav.serviceSlug}`}>
                    <h3 className="font-semibold text-sm text-[#1A1A2E] line-clamp-2 mb-2 group-hover:text-[#0D5D48] transition-colors">
                      {fav.serviceTitle}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-[#1A1A2E]">
                      {fav.serviceRating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#0D5D48]">
                      {parseFloat(fav.servicePrice).toLocaleString()}{" "}
                      <span className="text-xs font-medium">ل.س</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(fav.serviceId)}
                      disabled={removeFavorite.isPending}
                      className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">لا توجد خدمات مفضلة</h3>
            <p className="text-gray-500 text-sm mb-6">
              احفظ الخدمات التي تعجبك لتتمكن من الوصول إليها لاحقاً
            </p>
            <Link to="/services">
              <Button className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8">
                <ShoppingBag className="w-4 h-4 ml-2" />
                تصفح الخدمات
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
