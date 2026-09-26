"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Category = { group_name: string; sub_category: string; category_label: string };
type Spec = { key: string; value: string };

const NEW = "__new__";
const catKey = (c: Category) => `${c.group_name}|${c.sub_category}|${c.category_label}`;

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = !!productId;

  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [newCat, setNewCat] = useState<Category>({ group_name: "", sub_category: "", category_label: "" });
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sku, setSku] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => (await axios.get("/api/admin/categories")).data,
  });

  useEffect(() => {
    if (!editing) return;
    axios
      .get(`/api/admin/products/${productId}`)
      .then(({ data }) => {
        const p = data.product;
        setName(p.name);
        setDescription(p.description || "");
        setPrice(String(p.price));
        setMrp(String(p.regular_price ?? p.price));
        setCategoryKey(`${p.group_name}|${p.sub_category}|${p.category_label}`);
        setSpecs(p.specs || []);
        setInStock(!!p.in_stock);
        setFeatured(!!p.is_featured);
        setImages(p.images || []);
        setSku(p.sku || "");
        setLoaded(true);
      })
      .catch(() => {
        toast.error("Product not found");
        router.push("/admin/products");
      });
  }, [editing, productId, router]);

  const updateSpec = (i: number, patch: Partial<Spec>) =>
    setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const mrpNum = Number(mrp);
    if (!Number.isInteger(priceNum) || priceNum < 1) return toast.error("Price must be a whole number of at least 1");
    if (!Number.isInteger(mrpNum) || mrpNum < 1) return toast.error("MRP must be a whole number of at least 1");
    if (priceNum > mrpNum) return toast.error("Price cannot be higher than MRP");

    let cat: Category | undefined;
    if (categoryKey === NEW) {
      cat = newCat;
      if (!cat.group_name.trim() || !cat.sub_category.trim() || !cat.category_label.trim()) {
        return toast.error("Fill in all three category names");
      }
    } else {
      cat = categories?.find((c) => catKey(c) === categoryKey);
      if (!cat) return toast.error("Choose a category");
    }

    const payload = {
      name,
      description,
      price: priceNum,
      regular_price: mrpNum,
      ...cat,
      specs: specs.filter((s) => s.key.trim() && s.value.trim()),
      in_stock: inStock,
      is_featured: featured,
      ...(editing ? { images } : {}),
    };

    setSaving(true);
    try {
      let id = productId;
      if (editing) {
        await axios.put(`/api/admin/products/${productId}`, payload);
      } else {
        const { data } = await axios.post("/api/admin/products", payload);
        id = String(data.product.id);
      }
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await axios.post(`/api/admin/products/${id}/images`, fd);
      }
      toast.success(editing ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <Spinner />;

  return (
    <form onSubmit={submit} className="space-y-6 bg-white border rounded-lg p-4 sm:p-6">
      {editing && sku && (
        <p className="text-sm text-muted-foreground">
          SKU: <span className="font-mono text-foreground">{sku}</span>
        </p>
      )}
      <Field label="Name *">
        <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Price (₹) *">
          <Input type="number" min={1} step={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
        </Field>
        <Field label="MRP (₹) *" hint="Must be equal to or higher than the price.">
          <Input type="number" min={1} step={1} value={mrp} onChange={(e) => setMrp(e.target.value)} required />
        </Field>
      </div>

      <Field label="Category *">
        <select
          value={categoryKey}
          onChange={(e) => setCategoryKey(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-surface-1 px-3 py-2 text-sm"
          required
        >
          <option value="">Select a category…</option>
          {(categories || []).map((c) => (
            <option key={catKey(c)} value={catKey(c)}>
              {c.group_name} › {c.sub_category} › {c.category_label}
            </option>
          ))}
          {editing &&
            categoryKey &&
            categoryKey !== NEW &&
            !(categories || []).some((c) => catKey(c) === categoryKey) && (
              <option value={categoryKey}>{categoryKey.split("|").join(" › ")}</option>
            )}
          <option value={NEW}>+ Add a new category…</option>
        </select>
      </Field>
      {categoryKey === NEW && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-md border p-3 bg-surface-1">
          <Field label="Top-level category">
            <Input value={newCat.group_name} onChange={(e) => setNewCat({ ...newCat, group_name: e.target.value })} placeholder="e.g. Storage Devices" />
          </Field>
          <Field label="Parent category">
            <Input value={newCat.sub_category} onChange={(e) => setNewCat({ ...newCat, sub_category: e.target.value })} placeholder="e.g. Drives" />
          </Field>
          <Field label="Category">
            <Input value={newCat.category_label} onChange={(e) => setNewCat({ ...newCat, category_label: e.target.value })} placeholder="e.g. External SSDs" />
          </Field>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Specifications</label>
          <Button type="button" size="sm" variant="outline" onClick={() => setSpecs((s) => [...s, { key: "", value: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add row
          </Button>
        </div>
        {specs.length === 0 && <p className="text-xs text-muted-foreground">No specifications yet.</p>}
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input placeholder="Name (e.g. Length)" value={s.key} onChange={(e) => updateSpec(i, { key: e.target.value })} />
            <Input placeholder="Value (e.g. 2m)" value={s.value} onChange={(e) => updateSpec(i, { value: e.target.value })} />
            <button type="button" aria-label="Remove row" onClick={() => setSpecs((rows) => rows.filter((_, idx) => idx !== i))}>
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Images</label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative">
                <Image src={url} alt={`Image ${i + 1}`} width={88} height={88} unoptimized className="border rounded-md object-contain w-[88px] h-[88px] bg-white" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((l) => l.filter((u) => u !== url))}
                  className="absolute -top-2 -right-2 bg-white border rounded-full p-0.5"
                >
                  <X className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block text-sm"
        />
        {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} new file(s) will be converted to WebP and uploaded on save.</p>}
        <p className="text-xs text-muted-foreground">Up to 12 images per product, 8 MB each. Removing an image deletes it when you save.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : editing ? (
            "Save changes"
          ) : (
            "Create product"
          )}
        </Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
