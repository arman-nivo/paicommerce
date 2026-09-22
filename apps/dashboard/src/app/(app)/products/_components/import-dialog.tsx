"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CircleAlert, CircleCheck, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Badge, Button, buttonVariants, cn, Dialog, Select, Table, TBody, TD, TH, THead, TR, toast } from "@pai/ui";
import { parseCsv } from "@/lib/csv";
import { importProducts } from "../import-actions";
import { CSV_FIELDS, guessCsvField, IMPORT_MAX_ROWS, type CsvFieldKey } from "../_lib/shared";

type Result = { created: number; skipped: number; collectionsCreated: number; errors: { row: number; message: string }[]; limitReached: boolean };

export function ImportButton({ remaining, label = "Import", variant = "outline" }: { remaining: number | null; label?: string; variant?: "outline" | "default" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Upload /> {label}
      </Button>
      {open && <ImportDialog remaining={remaining} onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportDialog({ remaining, onClose }: { remaining: number | null; onClose: () => void }) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [data, setData] = React.useState<string[][]>([]);
  const [mapping, setMapping] = React.useState<(CsvFieldKey | "")[]>([]);
  const [drag, setDrag] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const blocked = remaining != null && remaining <= 0;

  const load = async (file: File) => {
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      toast.error("Please choose a .csv file (export from Excel/Google Sheets as CSV).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("That file is larger than 10 MB. Split it into smaller files.");
      return;
    }
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      toast.error("The file needs a header row and at least one product row.");
      return;
    }
    const [head, ...body] = rows;
    setFileName(file.name);
    setHeaders(head!.map((h) => h.trim()));
    setData(body);
    const used = new Set<string>();
    setMapping(
      head!.map((h) => {
        const g = guessCsvField(h);
        if (!g || used.has(g)) return "";
        used.add(g);
        return g;
      }),
    );
    setResult(null);
  };

  const titleMapped = mapping.includes("title");
  const tooMany = data.length > IMPORT_MAX_ROWS;
  const productRows = React.useMemo(() => {
    const ti = mapping.indexOf("title");
    return ti < 0 ? 0 : data.filter((r) => (r[ti] ?? "").trim()).length;
  }, [data, mapping]);

  const submit = async () => {
    const rows = data.map((r) => {
      const o: Record<string, string> = {};
      mapping.forEach((k, i) => {
        if (k) o[k] = r[i] ?? "";
      });
      const idIdx = headers.findIndex((h) => h.toLowerCase() === "id");
      if (idIdx >= 0) o.id = r[idIdx] ?? "";
      return o;
    });
    setBusy(true);
    try {
      const res = await importProducts({ rows, firstLine: 2 });
      if (!res.ok) toast.error(res.error);
      else {
        setResult(res.data);
        if (res.data.created) {
          toast.success(`Imported ${res.data.created} product${res.data.created > 1 ? "s" : ""}`);
          router.refresh();
        }
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadErrors = () => {
    if (!result?.errors.length) return;
    const csv = "row,problem\r\n" + result.errors.map((e) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "import-errors.csv";
    a.click();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title="Import products from CSV"
      description="Upload a spreadsheet saved as CSV. We'll match the columns for you — check the mapping, then import."
      footer={
        result ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <a href="/api/products/template" download className={cn(buttonVariants({ variant: "ghost" }), "mr-auto")}>
              <Download /> Download template
            </a>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy} disabled={!data.length || !titleMapped || tooMany || blocked}>
              Import {productRows ? `${productRows} product${productRows > 1 ? "s" : ""}` : ""}
            </Button>
          </>
        )
      }
    >
      {blocked ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CircleAlert className="size-8 text-amber-500" />
          <p className="font-medium">You&apos;ve reached your plan&apos;s product limit</p>
          <p className="max-w-sm text-sm text-muted-foreground">Upgrade your plan to import more products.</p>
          <Link href="/settings/billing" className={buttonVariants()}>
            View plans
          </Link>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <CircleCheck className="mb-1 size-5 text-emerald-600" />
              <div className="text-2xl font-bold tabular-nums">{result.created}</div>
              <div className="text-sm text-muted-foreground">products created{result.collectionsCreated ? ` · ${result.collectionsCreated} new collections` : ""}</div>
            </div>
            <div className={cn("rounded-xl border p-4", result.skipped ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border")}>
              <CircleAlert className="mb-1 size-5 text-amber-600" />
              <div className="text-2xl font-bold tabular-nums">{result.skipped}</div>
              <div className="text-sm text-muted-foreground">rows skipped</div>
            </div>
          </div>
          {result.limitReached && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              You&apos;ve hit your plan&apos;s product limit.{" "}
              <Link href="/settings/billing" className="font-medium underline">
                Upgrade to import the rest
              </Link>
              .
            </p>
          )}
          {result.errors.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Problems found</h4>
                <Button size="sm" variant="ghost" onClick={downloadErrors}>
                  <Download /> Download report
                </Button>
              </div>
              <ul className="max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border text-sm">
                {result.errors.map((e, i) => (
                  <li key={i} className="flex gap-3 px-3 py-2">
                    <span className="w-16 shrink-0 text-muted-foreground">Row {e.row}</span>
                    <span>{e.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : !data.length ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) load(f);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-12 text-center transition hover:border-primary",
              drag && "border-primary bg-accent",
            )}
          >
            <FileSpreadsheet className="size-8 text-primary" />
            <span className="font-medium">Drop your CSV here or click to browse</span>
            <span className="text-xs text-muted-foreground">Up to {IMPORT_MAX_ROWS.toLocaleString()} rows · 10 MB</span>
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Supported columns</p>
            <p>
              title (required), description, price, compare_at_price, cost, sku, barcode, inventory, status (active / draft / archived), vendor, type, tags (comma or | separated), image_urls (|
              separated), collection. Prices are in taka (e.g. 1250 or 1250.50).
            </p>
            {remaining != null && <p className="mt-1">You can add {remaining.toLocaleString()} more products on your current plan.</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <FileSpreadsheet className="size-4 text-primary" />
            <span className="font-medium">{fileName}</span>
            <Badge>{data.length.toLocaleString()} rows</Badge>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setData([])}>
              Choose another file
            </Button>
          </div>
          {!titleMapped && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">Map one column to “Title” — every product needs a title.</p>}
          {tooMany && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              This file has {data.length.toLocaleString()} rows. Import up to {IMPORT_MAX_ROWS.toLocaleString()} rows at a time.
            </p>
          )}
          {remaining != null && productRows > remaining && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              Your plan has room for {remaining} more product{remaining === 1 ? "" : "s"} — only the first {remaining} will be imported.{" "}
              <Link href="/settings/billing" className="font-medium underline">
                Upgrade
              </Link>
            </p>
          )}
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  {headers.map((h, i) => (
                    <TH key={i} className="min-w-40 py-2 align-top normal-case tracking-normal">
                      <div className="mb-1.5 truncate text-xs text-muted-foreground" title={h}>
                        {h || `Column ${i + 1}`}
                      </div>
                      <Select
                        value={mapping[i] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value as CsvFieldKey | "";
                          setMapping((m) => m.map((x, j) => (j === i ? v : v && x === v ? "" : x)));
                        }}
                        className={cn("h-8 text-xs", !mapping[i] && "text-muted-foreground")}
                        aria-label={`Map column ${h}`}
                      >
                        <option value="">Don&apos;t import</option>
                        {CSV_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </Select>
                    </TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {data.slice(0, 5).map((r, ri) => (
                  <TR key={ri}>
                    {headers.map((_, i) => (
                      <TD key={i} className={cn("max-w-56 truncate py-2 text-xs", !mapping[i] && "text-muted-foreground/60")} title={r[i]}>
                        {r[i] || "—"}
                      </TD>
                    ))}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing the first {Math.min(5, data.length)} of {data.length.toLocaleString()} rows. Rows with the same URL handle get a unique one automatically (e.g. -2).
          </p>
        </div>
      )}
    </Dialog>
  );
}
