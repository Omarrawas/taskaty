import { Link } from "react-router";
import { Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sellers } from "@/lib/mockData";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { getServiceImage } from "@/lib/storage";

interface ServiceCardProps {
  id?: string | number;
  sellerId: string | number;
  title: string;
  slug: string;
  price: string;
  images: string[];
  rating: string;
  totalReviews: number;
  featured?: boolean;
  deliveryTime?: number;
  categorySlug?: string;
}

export default function ServiceCard({
  id,
  sellerId,
  title,
  slug,
  price,
  images,
  rating,
  totalReviews,
  featured,
  deliveryTime: _deliveryTime,
  categorySlug,
}: ServiceCardProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const seller = sellers.find((s) => s.id === sellerId);
  const image = getServiceImage(images, categorySlug);
  const priceNum = parseFloat(price);

  const { data: favoriteData } = trpc.favorites.isFavorited.useQuery(
    { serviceId: String(id) },
    { enabled: !!user && !!id }
  );
  const isFavorited = favoriteData?.favorited ?? false;

  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onSuccess: async () => {
      await utils.favorites.isFavorited.invalidate({ serviceId: String(id) });
      await utils.favorites.list.invalidate();
      await utils.favorites.count.invalidate();
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (id) {
      toggleFavorite.mutate({ serviceId: String(id) });
    }
  };

  return (
    <Link to={`/services/${slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] card-hover transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-[#C49A2C] text-white border-0 rounded-full px-3 py-1 text-xs font-semibold">
              مميز
            </Badge>
          )}
          {/* Favorite Button */}
          {user && (
            <button
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isFavorited
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-white" : ""}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Seller */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={seller?.avatar || "/images/seller-1.jpg"}
              alt={seller?.name || "بائع"}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-sm text-[#1A1A2E] font-medium">
              {seller?.name || "بائع"}
            </span>
            {seller?.levelLabel && (
              <span className="text-xs bg-[#FDF6E3] text-[#C49A2C] px-2 py-0.5 rounded-full">
                {seller.levelLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[#1A1A2E] font-semibold text-base leading-snug line-clamp-2 mb-3 group-hover:text-[#0D5D48] transition-colors">
            {title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-[#1A1A2E]">{rating}</span>
            <span className="text-sm text-gray-500">({totalReviews})</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#F5F5F0] pt-3">
            <span className="text-sm text-gray-500">يبدأ من</span>
            <span className="text-lg font-bold text-[#0D5D48]">
              {priceNum.toLocaleString()} <span className="text-sm font-medium">ل.س</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
