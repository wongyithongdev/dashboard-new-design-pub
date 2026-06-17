"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  JobOrderDocumentPreview,
  type JobOrderDesignBlock,
  type JobOrderDesignPayload,
} from "@/components/JobOrderDocumentPreview";
import { ChevronDown, Menu, RotateCcw, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState, useDeferredValue, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DesignTextField = "companyName" | "address" | "contact";

type DesignFieldStyle = {
  color: string;
  fontSize: number;
  fontWeight: string;
};

type DesignTextSpan = {
  id: string;
  start: number;
  end: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
};

type ContextMenuState = {
  field: DesignTextField;
  x: number;
  y: number;
} | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const designColorOptions = [
  { label: "Black", value: "#111111" },
  { label: "Gray",  value: "#525252" },
  { label: "Red",   value: "#dc2626" },
  { label: "Blue",  value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
];

const designFontSizeOptions = [7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22];

const designColorPalette = [
  "#111111", "#374151", "#6b7280", "#9ca3af", "#ffffff",
  "#dc2626", "#ea580c", "#d97706", "#65a30d", "#16a34a",
  "#0891b2", "#2563eb", "#7c3aed", "#c026d3", "#db2777",
  "#fca5a5", "#fdba74", "#fde68a", "#bbf7d0", "#bfdbfe",
];

const DEFAULT_FIELD_STYLES: Record<DesignTextField, DesignFieldStyle> = {
  companyName: { color: "#111111", fontSize: 11, fontWeight: "bold"   },
  address:     { color: "#111111", fontSize: 9,  fontWeight: "normal" },
  contact:     { color: "#111111", fontSize: 9,  fontWeight: "normal" },
};

const DEFAULT_TEXT_SPANS: Record<DesignTextField, DesignTextSpan[]> = {
  companyName: [],
  address:     [],
  contact:     [],
};

const STORAGE_KEY = "joborder-design";

// ─── DesignColorPicker ────────────────────────────────────────────────────────

function DesignColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHexInput(value); }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function commitHex(raw: string) {
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      onChange(normalized.toLowerCase());
      setHexInput(normalized.toLowerCase());
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2 text-[12px] font-medium text-[#5f5e59] transition-colors duration-75 hover:bg-[#f6f5f4]"
      >
        <span
          className="size-3.5 shrink-0 rounded-[3px] border border-black/10"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono tabular-nums text-[#8f8983]">{value}</span>
        <ChevronDown size={11} className="shrink-0 text-[#a39e98]" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 w-52 rounded-[10px] border border-[#e6e6e6] bg-white p-3 shadow-[0_12px_28px_rgba(15,15,15,0.11)]">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-8 w-10 shrink-0 rounded-[6px] border border-[#e6e6e6]"
              style={{ backgroundColor: value }}
            />
            <input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => commitHex(hexInput)}
              onKeyDown={(e) => { if (e.key === "Enter") commitHex(hexInput); }}
              placeholder="#000000"
              maxLength={7}
              className="h-8 flex-1 rounded-[6px] border border-[#e6e6e6] bg-white px-2 font-mono text-[12px] text-[#2c2c2b] outline-none focus:border-[#0075de]"
            />
          </div>
          <div className="grid grid-cols-5 gap-1">
            {designColorPalette.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                className={`h-7 w-full rounded-[4px] border transition hover:scale-105 active:scale-95 ${value === color ? "border-[#0075de] ring-2 ring-[#0075de]/30" : "border-[#e6e6e6]"}`}
                style={{ backgroundColor: color }}
                onClick={() => { onChange(color); setHexInput(color); setOpen(false); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JoborderDesignPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving]           = useState(false);

  // Logo
  const [designLogoUrl,   setDesignLogoUrl]   = useState<string | null>(null);
  const [designLogoWidth, setDesignLogoWidth] = useState(150);

  // Text content
  const [designCompanyNameText,    setDesignCompanyNameText]    = useState("Example Micro Computer Sdn Bhd | Co. Reg. 1011180U");
  const [designCompanyAddressText, setDesignCompanyAddressText] = useState("26A, Jalan Lembah 3, Taman Desa Jaya, Johor Bahru, Johor 81100 Malaysia");
  const [designCompanyContactText, setDesignCompanyContactText] = useState("Tel: +60 17-790 7386 | Email: hello@example.com");

  // Styles & spans
  const [designFieldStyles, setDesignFieldStyles] = useState<Record<DesignTextField, DesignFieldStyle>>(DEFAULT_FIELD_STYLES);
  const [designTextSpans,   setDesignTextSpans]   = useState<Record<DesignTextField, DesignTextSpan[]>>(DEFAULT_TEXT_SPANS);

  // UI
  const [designPreviewZoom, setDesignPreviewZoom] = useState(100);
  const [contextMenu,       setContextMenu]       = useState<ContextMenuState>(null);

  // Refs
  const logoInputRef          = useRef<HTMLInputElement>(null);
  const designTextSelectionRef = useRef<{ field: DesignTextField; start: number; end: number } | null>(null);
  const contextMenuRef        = useRef<HTMLDivElement>(null);

  // Deferred values for performance
  const deferredCompanyName    = useDeferredValue(designCompanyNameText);
  const deferredCompanyAddress = useDeferredValue(designCompanyAddressText);
  const deferredCompanyContact = useDeferredValue(designCompanyContactText);
  const deferredFieldStyles    = useDeferredValue(designFieldStyles);
  const deferredTextSpans      = useDeferredValue(designTextSpans);

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.designLogoWidth)           setDesignLogoWidth(saved.designLogoWidth);
      if (saved.designCompanyNameText)     setDesignCompanyNameText(saved.designCompanyNameText);
      if (saved.designCompanyAddressText)  setDesignCompanyAddressText(saved.designCompanyAddressText);
      if (saved.designCompanyContactText)  setDesignCompanyContactText(saved.designCompanyContactText);
      if (saved.designFieldStyles)         setDesignFieldStyles(saved.designFieldStyles);
      if (saved.designTextSpans)           setDesignTextSpans(saved.designTextSpans);
      if (saved.designPreviewZoom)         setDesignPreviewZoom(saved.designPreviewZoom);
    } catch {}
  }, []);

  // ── Close context menu on outside click ──────────────────────────────────
  useEffect(() => {
    if (!contextMenu) return;
    function onPointerDown(e: PointerEvent) {
      if (!contextMenuRef.current?.contains(e.target as Node)) setContextMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [contextMenu]);

  // ── Text selection tracking ───────────────────────────────────────────────
  function rememberDesignTextSelection(field: DesignTextField, el: HTMLTextAreaElement) {
    designTextSelectionRef.current = {
      field,
      start: el.selectionStart ?? 0,
      end:   el.selectionEnd   ?? 0,
    };
  }

  // ── Update text + adjust span bounds ─────────────────────────────────────
  function updateDesignTextValue(field: DesignTextField, value: string) {
    const setters: Record<DesignTextField, (v: string) => void> = {
      companyName: setDesignCompanyNameText,
      address:     setDesignCompanyAddressText,
      contact:     setDesignCompanyContactText,
    };
    setters[field](value);
    setDesignTextSpans((prev) => ({
      ...prev,
      [field]: prev[field]
        .map((span) => ({ ...span, end: Math.min(span.end, value.length) }))
        .filter((span) => span.end > span.start),
    }));
  }

  // ── Apply style to selection or whole field ───────────────────────────────
  function applyDesignTextStyle(
    color?: string,
    fontSize?: number,
    field?: DesignTextField
  ) {
    const targetField = field ?? designTextSelectionRef.current?.field ?? "companyName";
    const sel = designTextSelectionRef.current;
    const hasSelection = sel && sel.field === targetField && sel.end > sel.start;

    if (hasSelection && sel) {
      // Apply to span range
      setDesignTextSpans((prev) => {
        const existing = prev[targetField].filter(
          (s) => !(s.start >= sel.start && s.end <= sel.end)
        );
        const newSpan: DesignTextSpan = {
          id:    `${Date.now()}-${Math.random()}`,
          start: sel.start,
          end:   sel.end,
          ...(color    != null ? { color }    : {}),
          ...(fontSize != null ? { fontSize } : {}),
        };
        return { ...prev, [targetField]: [...existing, newSpan] };
      });
    } else {
      // Apply to whole field style
      setDesignFieldStyles((prev) => ({
        ...prev,
        [targetField]: {
          ...prev[targetField],
          ...(color    != null ? { color }    : {}),
          ...(fontSize != null ? { fontSize } : {}),
        },
      }));
    }
  }

  function updateSelectedDesignColor(color: string, field?: DesignTextField) {
    applyDesignTextStyle(color, undefined, field);
  }

  function updateSelectedDesignFontSize(fontSize: number, field?: DesignTextField) {
    applyDesignTextStyle(undefined, fontSize, field);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        designLogoWidth,
        designCompanyNameText,
        designCompanyAddressText,
        designCompanyContactText,
        designFieldStyles,
        designTextSpans,
        designPreviewZoom,
      }));
    } catch {}
    setTimeout(() => setIsSaving(false), 800);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setDesignLogoUrl(null);
    setDesignLogoWidth(150);
    setDesignCompanyNameText("Example Micro Computer Sdn Bhd | Co. Reg. 1011180U");
    setDesignCompanyAddressText("26A, Jalan Lembah 3, Taman Desa Jaya, Johor Bahru, Johor 81100 Malaysia");
    setDesignCompanyContactText("Tel: +60 17-790 7386 | Email: hello@example.com");
    setDesignFieldStyles(DEFAULT_FIELD_STYLES);
    setDesignTextSpans(DEFAULT_TEXT_SPANS);
    setDesignPreviewZoom(100);
    designTextSelectionRef.current = null;
  }

  // ── Logo upload ───────────────────────────────────────────────────────────
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDesignLogoUrl(url);
  }

  // ── Build preview payload ─────────────────────────────────────────────────
  function buildBlock(field: DesignTextField, text: string): JobOrderDesignBlock {
    const style = deferredFieldStyles[field];
    return {
      visible:    true,
      text,
      fontSize:   style.fontSize,
      fontWeight: style.fontWeight,
      alignment:  "left",
      color:      style.color,
      spans: deferredTextSpans[field].map((s) => ({
        start:      s.start,
        end:        s.end,
        color:      s.color,
        fontSize:   s.fontSize,
        fontWeight: s.fontWeight,
      })),
    };
  }

  const designPreviewPayload: JobOrderDesignPayload = {
    schemaVersion: 1,
    documentType:  "joborder",
    logo: {
      visible:  true,
      url:      designLogoUrl ?? "",
      imageUrl: designLogoUrl ?? "",
      width:    designLogoWidth,
    },
    blocks: {
      companyName: buildBlock("companyName", deferredCompanyName),
      address:     buildBlock("address",     deferredCompanyAddress),
      contact:     buildBlock("contact",     deferredCompanyContact),
    },
  };

  // ── Render styled text content (for preview blocks) ───────────────────────
  function renderStyledTextContent(field: DesignTextField, content: string) {
    const spans = deferredTextSpans[field].filter(
      (s) => s.end > s.start && s.start < content.length
    );
    if (spans.length === 0) return content;

    const points = Array.from(
      new Set(
        [0, content.length].concat(
          spans.flatMap((s) => [Math.max(0, s.start), Math.min(content.length, s.end)])
        )
      )
    ).sort((a, b) => a - b);

    return points.slice(0, -1).map((start, index) => {
      const end = points[index + 1];
      const activeStyle = spans.reduce<{
        color?: string;
        fontSize?: number;
        fontWeight?: string;
      }>((acc, s) => {
        if (s.start <= start && s.end >= end) {
          return {
            color:      s.color      ?? acc.color,
            fontSize:   s.fontSize   ?? acc.fontSize,
            fontWeight: s.fontWeight ?? acc.fontWeight,
          };
        }
        return acc;
      }, {});

      return (
        <span
          key={`${field}-${start}-${end}`}
          style={{
            color:      activeStyle.color,
            fontSize:   activeStyle.fontSize ? `${activeStyle.fontSize}px` : undefined,
            fontWeight: activeStyle.fontWeight,
          }}
        >
          {content.slice(start, end)}
        </span>
      );
    });
  }

  // ── Preview block renderer (with right-click menu + click-to-select) ──────
  const getSelectableClass = useCallback(
    (field: DesignTextField) =>
      "rounded px-1 outline-none transition cursor-pointer hover:bg-black/5",
    []
  );

  function renderPreviewTextBlock(
    field: DesignTextField,
    content: string,
    className: string,
    style: React.CSSProperties
  ) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => { designTextSelectionRef.current = null; }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ field, x: e.clientX, y: e.clientY });
        }}
        className={`${getSelectableClass(field)} ${className}`}
        style={style}
      >
        {renderStyledTextContent(field, content)}
      </div>
    );
  }

  // ── Textarea section ──────────────────────────────────────────────────────
  const textareaBase =
    "w-full resize-none rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-[13px] leading-relaxed text-[#2c2c2b] outline-none transition placeholder:text-[#c5c0bb] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20";

  function renderTextSection(
    field: DesignTextField,
    label: string,
    value: string,
    rows: number
  ) {
    return (
      <div className="border-b border-[#e6e6e6] px-4 py-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-[#8f8983]">{label}</span>
          <DesignColorPicker
            value={designFieldStyles[field].color}
            onChange={(color) => updateSelectedDesignColor(color, field)}
          />
        </div>
        <textarea
          value={value}
          rows={rows}
          onFocus={(e)      => rememberDesignTextSelection(field, e.currentTarget)}
          onClick={(e)      => rememberDesignTextSelection(field, e.currentTarget)}
          onSelect={(e)     => rememberDesignTextSelection(field, e.currentTarget)}
          onKeyUp={(e)     => rememberDesignTextSelection(field, e.currentTarget)}
          onMouseUp={(e)    => rememberDesignTextSelection(field, e.currentTarget)}
          onContextMenu={(e) => {
            e.preventDefault();
            rememberDesignTextSelection(field, e.currentTarget);
            setContextMenu({ field, x: e.clientX, y: e.clientY });
          }}
          onChange={(e) => updateDesignTextValue(field, e.target.value)}
          className={textareaBase}
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {designFontSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateSelectedDesignFontSize(size, field)}
              className={`h-6 min-w-[26px] rounded-[4px] border px-1 text-[10px] font-medium tabular-nums transition ${
                designFieldStyles[field].fontSize === size
                  ? "border-[#0075de] bg-[#0075de] text-white"
                  : "border-[#e6e6e6] bg-white text-[#8f8983] hover:bg-[#f6f5f4]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const previewScale = designPreviewZoom / 100;

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
              className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
            >
              <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
              Design
            </h1>
          </div>
        </header>

        {/* Body: sidebar + preview */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left sidebar */}
          <aside className="hide-scrollbar h-full w-[300px] shrink-0 overflow-y-auto border-r border-[#e6e6e6] bg-white">
            {/* Save + Reset */}
            <div className="border-b border-[#e6e6e6] px-4 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[7px] bg-[#0075de] text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.22)] transition-colors duration-75 hover:bg-[#0b83ea] disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Save size={13} aria-hidden="true" />
                  )}
                  {isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[13px] font-medium text-[#615d59] transition-colors duration-75 hover:bg-[#f6f5f4] disabled:opacity-60"
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            {/* Logo */}
            <div className="border-b border-[#e6e6e6] px-4 py-4">
              <p className="mb-3 text-[12px] font-semibold text-[#8f8983]">Company Logo</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white text-[13px] font-medium text-[#615d59] transition-colors duration-75 hover:bg-[#f6f5f4]"
              >
                <Upload size={13} aria-hidden="true" />
                {designLogoUrl ? "Replace Logo" : "Upload Logo"}
              </button>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[12px] text-[#a39e98]">
                  <span>Logo Size</span>
                  <span className="font-medium tabular-nums">{designLogoWidth}px</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={300}
                  step={1}
                  value={designLogoWidth}
                  onChange={(e) => setDesignLogoWidth(Number(e.target.value))}
                  className="w-full accent-[#0075de]"
                />
              </div>
            </div>

            {/* Company Name */}
            {renderTextSection("companyName", "Company Name", designCompanyNameText, 2)}

            {/* Company Address */}
            {renderTextSection("address", "Company Address", designCompanyAddressText, 3)}

            {/* Contact / Tel */}
            {renderTextSection("contact", "Contact / Tel", designCompanyContactText, 2)}

            {/* Preview Zoom */}
            <div className="px-4 py-4">
              <div className="mb-2 flex items-center justify-between text-[12px] text-[#a39e98]">
                <span>Preview Zoom</span>
                <span className="font-medium tabular-nums">{designPreviewZoom}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={140}
                step={5}
                value={designPreviewZoom}
                onChange={(e) => setDesignPreviewZoom(Number(e.target.value))}
                className="w-full accent-[#0075de]"
              />
            </div>
          </aside>

          {/* Preview area */}
          <main className="hide-scrollbar min-h-0 flex-1 overflow-auto bg-[#f6f5f4] p-6">
            <JobOrderDocumentPreview
              design={designPreviewPayload}
              zoom={previewScale}
              renderLogo={(defaultLogo) => (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex min-h-[88px] w-full items-center justify-center rounded border-0 bg-transparent p-1 transition hover:bg-black/5"
                  title="Click to upload logo"
                >
                  {designLogoUrl ? defaultLogo : (
                    <span>
                      <span className="block text-[40px] font-black leading-none tracking-tight text-zinc-900">LOGO</span>
                      <span className="mt-1 block text-[12px] font-semibold tracking-[0.18em] text-zinc-500">CLICK TO UPLOAD</span>
                    </span>
                  )}
                </button>
              )}
              renderBlock={(field, content, className, style) =>
                renderPreviewTextBlock(field as DesignTextField, content, className, style)
              }
            />
          </main>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[180px] overflow-hidden rounded-[10px] border border-[#e6e6e6] bg-white py-1 shadow-[0_12px_28px_rgba(15,15,15,0.14)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
            Text Color
          </div>
          {designColorOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                updateSelectedDesignColor(opt.value, contextMenu.field);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] text-[#2c2c2b] transition-colors duration-75 hover:bg-[#f6f5f4]"
            >
              <span
                className="size-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: opt.value }}
              />
              {opt.label}
            </button>
          ))}
          <div className="mx-2 my-1 h-px bg-[#f0ede8]" />
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
            Font Size
          </div>
          <div className="flex flex-wrap gap-1 px-3 pb-2 pt-1">
            {designFontSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  updateSelectedDesignFontSize(size, contextMenu.field);
                  setContextMenu(null);
                }}
                className={`h-6 min-w-[26px] rounded-[4px] border px-1 text-[10px] font-medium tabular-nums transition ${
                  designFieldStyles[contextMenu.field].fontSize === size
                    ? "border-[#0075de] bg-[#0075de] text-white"
                    : "border-[#e6e6e6] bg-white text-[#8f8983] hover:bg-[#f6f5f4]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
