import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';

export const ProductCard = ({ product, token, fetchProducts, onEdit }) => {
  const { toast } = useToast();

  const renderText = (value) => {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object" && "name" in value) return value.name;
    return "";
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("هل تريد حذف هذا الكورس؟")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "✓ تم حذف الكورس" });
      fetchProducts();
    } catch (err) {
      toast({ title: "فشل حذف الكورس", variant: "destructive" });
    }
  };

  return (
    <Card className="p-5 border border-gray-200 hover:shadow-md transition-all">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center">
          <img
            src={product.imageCover || "https://via.placeholder.com/80"}
            alt={renderText(product.title)}
            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">الكورس</p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {renderText(product.title)}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">
            {renderText(product.description)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">السعر والكمية</p>
          <p className="text-lg font-bold text-purple-600">
            ${product.price?.toFixed(2) ?? "0.00"}
          </p>
          <p className="text-xs text-gray-500">المخزون: {product.quantity ?? 0}</p>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 px-3"
            onClick={onEdit}
          >
            تعديل
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-3"
            onClick={() => handleDeleteProduct(product._id)}
          >
            حذف
          </Button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {product.vedios && product.vedios.length > 0 && (
            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded flex items-center gap-1">
              <Play size={12} />
              {product.vedios.length} فيديو
            </span>
          )}
        </div>
        {product.category && (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded">
            {renderText(product.category)}
          </span>
        )}
      </div>
    </Card>
  );
};
