"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import TitleHeader from "../../_components/title-header";
import Pager from "../../_components/pager";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/currency";

type Row = {
  id: number;
  sku: string;
  name: string;
  price: number;
  regular_price: number;
  images: string[] | null;
  group_name: string;
  category_label: string;
  in_stock: boolean;
  is_featured: boolean;
};

const ProductsPage = () => {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, error } = useQuery<{ products: Row[]; total: number; totalPages: number }>({
    queryKey: ["admin-products", search, page],
    queryFn: async () => (await axios.get("/api/admin/products", { params: { q: search, page } })).data,
  });

  const remove = async (p: Row) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/products/${p.id}`);
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Could not delete product");
    }
  };

  return (
    <div className="p-3 sm:p-4 mt-2">
      <TitleHeader
        title="Products"
        count={data?.total}
        description="Manage products for your store"
        url="/admin/products/new"
      />
      <Input
        placeholder="Search by name, SKU or category…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm mb-4"
      />
      {isLoading ? (
        <Spinner />
      ) : error || !data ? (
        <p>Something went wrong!</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-gray-700 border-b bg-surface-1">
                <th className="p-3 font-medium">Image</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium text-right">Price</th>
                <th className="p-3 font-medium text-right">MRP</th>
                <th className="p-3 font-medium text-center">Stock</th>
                <th className="p-3 font-medium text-center">Featured</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">
                    {p.images && p.images[0] ? (
                      <Image src={p.images[0]} alt={p.name} width={48} height={48} unoptimized className="border rounded-sm object-contain w-12 h-12" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center text-[10px] text-gray-500">No image</div>
                    )}
                  </td>
                  <td className="p-3 max-w-[280px]">
                    <p className="line-clamp-2">{p.name}</p>
                  </td>
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3">{p.category_label}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(p.price)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(p.regular_price)}</td>
                  <td className="p-3 text-center">{p.in_stock ? "In stock" : <span className="text-red-600">Out</span>}</td>
                  <td className="p-3 text-center">{p.is_featured ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/admin/products/${p.id}`} aria-label="Edit product">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(p)} aria-label="Delete product">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.products.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
};

export default ProductsPage;
