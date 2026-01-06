import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface CourseCardProps {
  course: any;
  isInWishlist: boolean;
  getImageUrl: (path: string | undefined) => string;
  handleImageError: (e: any) => void;
  toggleWishlist: (id: string, e: any) => void;
  navigate: (path: string) => void;
}

export default function CourseCard({
  course,
  isInWishlist,
  getImageUrl,
  handleImageError,
  toggleWishlist,
  navigate
}: CourseCardProps) {
  const isPaid = course.isPaid === true;
  const isStream = course.isStream === true;

  const getBadges = () => {
    if (isStream) {
      if (course.contentType === 'live') return <div className="absolute top-4 right-4 bg-red-600 animate-pulse text-white text-[10px] font-bold px-2 py-0.5 rounded-full">مباشر الآن</div>;
      if (course.contentType === 'upcoming') return <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">بث قادم</div>;
      if (course.contentType === 'recorded') return <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">جلسة مسجلة</div>;
    }
    if (isPaid) return <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full text-center">مشترك</div>;
    return null;
  };

  const handleGo = () => {
    if (isStream) {
      navigate(`/live/${course._id}`);
    } else if (isPaid) {
      navigate(`/course/${course._id}`);
    } else {
      navigate(`/course-details/${course._id}`);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-gray-100 bg-white overflow-hidden group">
      <CardHeader className="p-0 relative overflow-hidden h-48">
        <img
          src={getImageUrl(course.imageCover)}
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
          loading="lazy"
        />

        {getBadges()}

        <button
          onClick={(e) => toggleWishlist(course._id, e)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
        >
          <Heart
            size={18}
            className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow p-5 space-y-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
          <span className="text-blue-600 font-bold text-base">
            {course.price === 0 ? 'مجاني' : `$${course.price}`}
          </span>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        <div className="pt-4 mt-auto">
          <Button
            onClick={handleGo}
            variant={isPaid || isStream ? "default" : "outline"}
            className={`w-full font-bold text-sm h-10 rounded-xl transition-all ${isStream && course.contentType === 'live'
                ? 'bg-red-600 hover:bg-red-700 text-white border-0'
                : (isPaid || isStream ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' : 'border-blue-600 text-blue-600 hover:bg-blue-50')
              }`}
          >
            {isStream ? (course.contentType === 'live' ? 'دخول البث' : 'عرض التفاصيل') : (isPaid ? 'متابعة التعلم' : 'عرض التفاصيل')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
