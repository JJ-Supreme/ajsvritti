"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Download, Loader2, Upload } from "lucide-react";
import TitleHeader from "../../../_components/title-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Result = { created: number; updated: number; failed: number; errors: { row: number; sku: string; error: string }[] };

const ImportExportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const doImport = async () => {
    if (!file) return toast.error("Choose a CSV file first");
    setBusy(true);
    setResult(null);
    try {
      const csv = await file.text();
      const { data } = await axios.post<Result>("/api/admin/products/import", { csv });
      setResult(data);
      toast.success(`Imported: ${data.created} created, ${data.updated} updated`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 mt-2 max-w-3xl">
      <TitleHeader title="Import / Export" description="Download the catalog as CSV, or bulk create and update products" />

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Downloads every product with its price, MRP, category, specs and image links.</p>
          <a href="/api/admin/products/export">
            <Button>
              <Download className="h-4 w-4 mr-2" /> Download CSV
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Rows are matched by <code>sku</code>: an existing SKU is updated, a new or empty SKU creates a product. Required columns:{" "}
            <code>name, price, regular_price, group_name, sub_category, category_label</code>. Optional: <code>sku, description, in_stock, is_featured, specs_json, image_urls</code>.
            Rows with a price higher than the MRP are skipped and reported. Tip: export first and edit that file.
          </p>
          <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block text-sm" />
          <Button onClick={doImport} disabled={busy || !file}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {busy ? "Importing…" : "Import CSV"}
          </Button>
          {result && (
            <div className="rounded-md border p-3 text-sm space-y-2">
              <p>
                <strong>{result.created}</strong> created, <strong>{result.updated}</strong> updated,{" "}
                <strong className={result.failed ? "text-red-600" : ""}>{result.failed}</strong> failed.
              </p>
              {result.errors.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-red-700">
                  {result.errors.map((er, i) => (
                    <li key={i}>
                      Row {er.row}
                      {er.sku ? ` (${er.sku})` : ""}: {er.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportPage;
