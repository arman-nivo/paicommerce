import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ValidationReport } from "@/lib/registry-validate";

export function ValidationReportView({ report }: { report: ValidationReport }) {
  const errors = report.issues.filter((i) => i.level === "error");
  const warnings = report.issues.filter((i) => i.level === "warning");
  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2 text-sm">
        {errors.length ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
            <XCircle className="size-4" /> {errors.length} error{errors.length === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
            <CheckCircle2 className="size-4" /> validateTheme passed
          </span>
        )}
        {warnings.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="size-4" /> {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </span>
        )}
        {report.stats && (
          <span className="ml-auto text-xs text-muted-foreground">
            v{report.stats.version} · {report.stats.sections} sections · {report.stats.presets} presets · {report.stats.settingsGroups} setting groups · templates: {report.stats.templates.join(", ") || "none"}
          </span>
        )}
      </div>
      {report.issues.length > 0 && (
        <ul className="max-h-56 divide-y divide-border overflow-y-auto text-xs scrollbar-thin">
          {report.issues.map((i, k) => (
            <li key={k} className="flex gap-2 px-3 py-1.5">
              <span className={i.level === "error" ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>{i.level}</span>
              <code className="shrink-0 text-muted-foreground">{i.path}</code>
              <span>{i.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
