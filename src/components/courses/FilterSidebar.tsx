import React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  minPrice: number;
  maxPrice: number;
  onClear: () => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  onClear,
  selectedTypes,
  setSelectedTypes,
  className,
}) => {
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleTypeChange = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">تصفية النتائج</h3>
        {(selectedCategories.length > 0 ||
          selectedTypes.length > 0 ||
          priceRange[0] > minPrice ||
          priceRange[1] < maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto p-0 px-2"
            >
              مسح الكل
              <X className="mr-1 h-3 w-3" />
            </Button>
          )}
      </div>

      <Accordion type="multiple" defaultValue={["categories", "types", "price"]} className="w-full">
        {/* Categories Filter */}
        <AccordionItem value="categories">
          <AccordionTrigger>التصنيفات</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category._id}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => handleCategoryChange(category._id)}
                  />
                  <Label
                    htmlFor={category._id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">لا توجد تصنيفات</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Content Type Filter */}
        <AccordionItem value="types">
          <AccordionTrigger>نوع المحتوى</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {[
                { id: 'course', name: 'كورس مسجل' },
                { id: 'live', name: 'بث مباشر الآن' },
                { id: 'upcoming', name: 'بث قادم' },
                { id: 'recorded', name: 'بثوث تم تسجيلها' }
              ].map((type) => (
                <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeChange(type.id)}
                  />
                  <Label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {type.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>السعر</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-2 space-y-6">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                value={priceRange}
                min={minPrice}
                max={maxPrice}
                step={1}
                onValueChange={setPriceRange}
                className="my-4"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="border rounded px-2 py-1 min-w-[60px] text-center text-sm">
                  {priceRange[0]} $
                </div>
                <span className="text-gray-400 text-xs text-nowrap">إلى</span>
                <div className="border rounded px-2 py-1 min-w-[60px] text-center text-sm">
                  {priceRange[1]} $
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterSidebar;
