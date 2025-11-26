import React, { useState } from "react";
import { ProductCard } from "./ProductCard";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ProductsComponent = ({ products, token, fetchProducts, searchQuery }) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} className="mr-2" />
          إضافة كورس جديد
        </Button>
      </div>

      {products.length === 0 && !showAddModal ? (
        <p className="text-center py-12 text-gray-500 text-lg">📦 لا توجد كورسات</p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            token={token}
            fetchProducts={fetchProducts}
            onEdit={() => handleEditClick(product)}
          />
        ))
      )}

      {editingProduct && formData && (
        <EditProductModal
          product={editingProduct}
          formData={formData}
          setFormData={setFormData}
          setEditingProduct={setEditingProduct}
          fetchProducts={fetchProducts}
          token={token}
        />
      )}

      {showAddModal && (
        <AddProductModal
          token={token}
          fetchProducts={fetchProducts}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
