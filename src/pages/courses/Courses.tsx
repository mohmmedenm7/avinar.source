import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';
import { Heart, SlidersHorizontal } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import FilterSidebar from "@/components/courses/FilterSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/fallback.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/products/')) return `${API_BASE_URL}${imagePath}`;
    if (!imagePath.includes('/')) return `${API_BASE_URL}/products/${imagePath}`;
    return `${API_BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const handleImageError = (e: any) => {
    e.currentTarget.src = '/fallback.jpg';
    e.currentTarget.onerror = null;
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log('Fetching courses and streams...');
      const [coursesRes, streamsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/products`).catch(err => {
          console.error('Products fetch error:', err);
          return { data: { data: [] } };
        }),
        axios.get(`${API_BASE_URL}/api/v1/livestreams/all`).catch(err => {
          console.error('Streams fetch error:', err);
          return { data: { data: [] } };
        })
      ]);

      const coursesData = coursesRes.data?.data || [];
      const streamsData = streamsRes.data?.data || [];

      // Normalize streams to look like courses
      const normalizedStreams = streamsData.map((s: any) => ({
        ...s,
        imageCover: s.thumbnail || s.imageCover,
        contentType: s.status === 'live' ? 'live' : (s.status === 'scheduled' ? 'upcoming' : 'recorded'),
        isStream: true
      }));

      const normalizedCourses = coursesData.map((c: any) => ({
        ...c,
        contentType: 'course',
        isStream: false
      }));

      let allContent = [...normalizedCourses, ...normalizedStreams];

      // Efficiently check payment status if logged in
      if (email && token && allContent.length > 0) {
        try {
          // Fetch all purchased product IDs once
          const purchasedRes = await axios.get(`${API_BASE_URL}/api/v1/products/purchased/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const purchasedIds = new Set((purchasedRes.data?.data || []).map((p: any) => p._id));

          allContent = allContent.map(item => ({
            ...item,
            // Streams are assumed public for now, or adjust as needed
            isPaid: item.isStream ? true : purchasedIds.has(item._id)
          }));
        } catch (statusErr) {
          console.error('Could not fetch purchased products:', statusErr);
          // Fallback: assume unpaid if fetch fails, but don't break the page
          allContent = allContent.map(item => ({ ...item, isPaid: item.isStream }));
        }
      }

      setCourses(allContent);

      // Calculate Min/Max Price from courses only
      if (coursesData.length > 0) {
        const prices = coursesData.map((c: any) => c.price || 0);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
        setPriceRange([min, max]);
      }
    } catch (error: any) {
      console.error('Critical error in fetchCourses:', error);
      toast({ title: 'خطأ في جلب الكورسات. يرجى محاولة تحديث الصفحة.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/categories`);
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      setWishlistIds(res.data?.data.map((item: any) => item._id) || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchWishlist();
    fetchCourses();
  }, [token, email]);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const toggleWishlist = async (productId: string, e: any) => {
    e.stopPropagation();
    if (!token) {
      toast({ title: 'يرجى تسجيل الدخول أولاً', variant: 'destructive' });
      navigate('/login');
      return;
    }

    try {
      if (wishlistIds.includes(productId)) {
        await axios.delete(`${API_BASE_URL}/api/v1/wishlist/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistIds(wishlistIds.filter(id => id !== productId));
        toast({ title: '✓ تم الحذف من قائمة الأمنيات' });
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/wishlist`, { productId }, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistIds([...wishlistIds, productId]);
        toast({ title: '✓ تمت الإضافة لقائمة الأمنيات' });
      }
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      // Search - البحث في العنوان، النوع، والوصف
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(query) ||
        (course.contentType && course.contentType.toLowerCase().includes(query)) ||
        (course.description && course.description.toLowerCase().includes(query));

      // Category (Multi-select)
      const matchesCategory = selectedCategories.length === 0 ||
        (course.category && (
          (typeof course.category === 'object' && (selectedCategories.includes(course.category._id) || selectedCategories.includes(course.category.id))) ||
          (typeof course.category === 'string' && selectedCategories.includes(course.category))
        ));

      // Price
      const matchesPrice = (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1];

      // Content Type
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(course.contentType);

      return matchesSearch && matchesCategory && matchesPrice && matchesType;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      } else if (sortBy === 'popular') {
        // Sort by popularity (assuming ratingsAverage or sold count implies popularity)
        // Adjust these fields based on your actual data structure
        const scoreA = (a.ratingsAverage || 0) * 10 + (a.sold || 0);
        const scoreB = (b.ratingsAverage || 0) * 10 + (b.sold || 0);
        return scoreB - scoreA;
      } else {
        // Newest (assuming createdAt exists, otherwise fallback to index/default)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [courses, searchQuery, selectedCategories, priceRange, sortBy, selectedTypes]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceRange([minPrice, maxPrice]);
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">الكورسات المتاحة</h1>

        {/* Top Bar: Search & Sort & Mobile Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="ابحث عن كورس..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="الترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="popular">شائع</SelectItem>
                <SelectItem value="price-low">السعر: الأقل إلى الأعلى</SelectItem>
                <SelectItem value="price-high">السعر: الأعلى إلى الأقل</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2 bg-white">
                  <SlidersHorizontal size={16} />
                  الفلتر
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-right">تصفية النتائج</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <FilterSidebar
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    selectedTypes={selectedTypes}
                    setSelectedTypes={setSelectedTypes}
                    onClear={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  selectedTypes={selectedTypes}
                  setSelectedTypes={setSelectedTypes}
                  onClear={clearFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      isInWishlist={wishlistIds.includes(course._id)}
                      getImageUrl={getImageUrl}
                      handleImageError={handleImageError}
                      toggleWishlist={toggleWishlist}
                      navigate={navigate}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-500 text-lg mb-4">لا توجد نتائج تطابق بحثك.</p>
                    <Button variant="outline" onClick={clearFilters}>
                      مسح جميع الفلاتر
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
