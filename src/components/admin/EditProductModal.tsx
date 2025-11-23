import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const FIXED_QUANTITY = "1";
const FIXED_CATEGORY = "691f6bd063a0a3709983d118";

export const EditProductModal = ({ product, formData, setFormData, setEditingProduct, fetchProducts, token }) => {
  const { toast } = useToast();

  const renderText = (value) => {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object" && "name" in value) return value.name;
    return "";
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSaveEdit = async () => {
    const fd = new FormData();
    fd.append("title", renderText(formData.title));
    fd.append("description", renderText(formData.description));
    fd.append("quantity", FIXED_QUANTITY);
    fd.append("price", String(formData.price ?? 0));
    fd.append("category", FIXED_CATEGORY);

    if (formData.imageCover instanceof File) fd.append("imageCover", formData.imageCover);
    if (formData.vedios?.length > 0) formData.vedios.forEach((f) => fd.append("vedios", f));

    try {
      await axios.put(`http://localhost:8000/api/v1/products/${product._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "✓ تم تعديل الكورس" });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast({ title: "فشل تعديل الكورس", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">تعديل الكورس</h2>
        <div className="space-y-4 text-right">
          <Input
            value={renderText(formData.title)}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="text-right"
          />
          <textarea
            value={renderText(formData.description)}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full border rounded p-2 text-right"
            rows={3}
          />
          <Input
            type="number"
            value={formData.price || 0}
            onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
          />
        </div>
        <div className="flex justify-start gap-2 mt-6">
          <Button onClick={() => setEditingProduct(null)}>إلغاء</Button>
          <Button onClick={handleSaveEdit}>حفظ التغييرات</Button>
        </div>
      </Card>
    </div>
  );
};
