"use client";

import { DashboardSidebar } from "@/components/sidebar";
import { Menu, RotateCcw, Save } from "lucide-react";
import { useEffect, useRef, useState, useDeferredValue, useCallback } from "react";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesDesignField = "companyName" | "address1" | "address2" | "tel" | "gst" | "payableName";

type SalesDesignFieldStyle = {
  color: string;
  fontSize: number;
  fontWeight: number;
};

type SalesDesignTextSpan = {
  id: string;
  start: number;
  end: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
};

type ContextMenuState = {
  field: SalesDesignField;
  x: number;
  y: number;
} | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const salesDesignColorOptions = [
  { label: "Black",  value: "#111111" },
  { label: "Gray",   value: "#525252" },
  { label: "Red",    value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Green",  value: "#16a34a" },
  { label: "Blue",   value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Pink",   value: "#db2777" },
];

const salesDesignFontSizeOptions = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20];

const defaultStyles: Record<SalesDesignField, SalesDesignFieldStyle> = {
  companyName: { color: "#111111", fontSize: 14, fontWeight: 800 },
  address1:    { color: "#111111", fontSize: 12, fontWeight: 400 },
  address2:    { color: "#111111", fontSize: 12, fontWeight: 400 },
  tel:         { color: "#111111", fontSize: 12, fontWeight: 400 },
  gst:         { color: "#111111", fontSize: 12, fontWeight: 400 },
  payableName: { color: "#111111", fontSize: 12, fontWeight: 400 },
};

const defaultTexts: Record<SalesDesignField, string> = {
  companyName: "EXAMPLE COMPANY SDN BHD (1234567-X)",
  address1:    "NO. 1, SAMPLE STREET, SAMPLE BUSINESS PARK",
  address2:    "50000 KUALA LUMPUR MALAYSIA",
  tel:         "+60 12 345 6789",
  gst:         "000000000000",
  payableName: "EXAMPLE COMPANY SDN. BHD.",
};

const defaultSpans: Record<SalesDesignField, SalesDesignTextSpan[]> = {
  companyName: [{ id: "companyName-default-red", start: 0, end: 7, color: "#dc2626" }],
  address1:    [],
  address2:    [],
  tel:         [],
  gst:         [],
  payableName: [],
};

const fieldLabels: Record<SalesDesignField, string> = {
  companyName: "Company Name",
  address1:    "Address 1",
  address2:    "Address 2",
  tel:         "Tel",
  gst:         "GST",
  payableName: "Payable Name",
};

const STORAGE_KEY = "salesorder-design";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMaxFontSize(baseFontSize: number, spans: SalesDesignTextSpan[]) {
  return Math.max(baseFontSize, ...spans.map((s) => s.fontSize ?? 0));
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function SalesDesignColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-[#e6e6e6] bg-transparent p-0.5"
        aria-label="Choose color"
      />
      <div className="flex flex-wrap gap-1">
        {salesDesignColorOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={`h-4 w-4 rounded-sm border transition ${
              value.toLowerCase() === opt.value.toLowerCase()
                ? "border-[#111] ring-1 ring-[#111]"
                : "border-[#e6e6e6]"
            }`}
            style={{ backgroundColor: opt.value }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesOrderDesignPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [texts,  setTexts]  = useState<Record<SalesDesignField, string>>(defaultTexts);
  const [styles, setStyles] = useState<Record<SalesDesignField, SalesDesignFieldStyle>>(defaultStyles);
  const [spans,  setSpans]  = useState<Record<SalesDesignField, SalesDesignTextSpan[]>>(defaultSpans);
  const [selectedField, setSelectedField] = useState<SalesDesignField>("companyName");
  const [contextMenu, setContextMenu]     = useState<ContextMenuState>(null);

  const textSelectionRef = useRef<{ field: SalesDesignField; start: number; end: number } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved) as {
        texts?:  Partial<Record<SalesDesignField, string>>;
        styles?: Partial<Record<SalesDesignField, SalesDesignFieldStyle>>;
        spans?:  Partial<Record<SalesDesignField, SalesDesignTextSpan[]>>;
      };
      if (data.texts)  setTexts((prev)  => ({ ...prev,  ...data.texts  }));
      if (data.styles) setStyles((prev) => ({ ...prev,  ...data.styles }));
      if (data.spans)  setSpans((prev)  => ({ ...prev,  ...data.spans  }));
    } catch {
      // ignore
    }
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("pointerdown", close, { capture: true });
    return () => window.removeEventListener("pointerdown", close, { capture: true });
  }, [contextMenu]);

  // ── Text selection tracking ────────────────────────────────────────────────

  const rememberSelection = useCallback((field: SalesDesignField, el: HTMLInputElement) => {
    setSelectedField(field);
    if (el.selectionStart == null || el.selectionEnd == null) {
      textSelectionRef.current = null;
      return;
    }
    const start = Math.min(el.selectionStart, el.selectionEnd);
    const end   = Math.max(el.selectionStart, el.selectionEnd);
    textSelectionRef.current = { field, start, end };
  }, []);

  const updateText = useCallback((field: SalesDesignField, value: string) => {
    setTexts((prev) => ({ ...prev, [field]: value }));
    setSpans((prev) => {
      if (prev[field].length === 0) return prev;
      return {
        ...prev,
        [field]: prev[field]
          .filter((s) => s.start < value.length)
          .map((s) => ({ ...s, end: Math.min(s.end, value.length) }))
          .filter((s) => s.end > s.start),
      };
    });
  }, []);

  const applyStyle = useCallback((field: SalesDesignField, patch: { color?: string; fontSize?: number }) => {
    const sel = textSelectionRef.current;
    const hasSelection = sel?.field === field && sel.end > sel.start;

    if (!hasSelection) {
      setStyles((prev) => ({ ...prev, [field]: { ...prev[field], ...patch } }));
      return;
    }

    setSpans((prev) => ({
      ...prev,
      [field]: prev[field].concat({
        id:       `${field}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        start:    sel.start,
        end:      sel.end,
        color:    patch.color,
        fontSize: patch.fontSize,
      }),
    }));
  }, []);

  const applyColor    = useCallback((color: string, field?: SalesDesignField) => {
    applyStyle(field ?? selectedField, { color });
  }, [applyStyle, selectedField]);

  const applyFontSize = useCallback((size: number, field?: SalesDesignField) => {
    applyStyle(field ?? selectedField, { fontSize: size });
  }, [applyStyle, selectedField]);

  // ── Persistence ───────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ texts, styles, spans }));
    } finally {
      setTimeout(() => setIsSaving(false), 700);
    }
  }, [texts, styles, spans]);

  const handleReset = useCallback(() => {
    setTexts(defaultTexts);
    setStyles(defaultStyles);
    setSpans(defaultSpans);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Deferred values for preview ───────────────────────────────────────────

  const dTexts  = useDeferredValue(texts);
  const dStyles = useDeferredValue(styles);
  const dSpans  = useDeferredValue(spans);

  // ── Styled text renderer ──────────────────────────────────────────────────

  const renderStyledText = useCallback((field: SalesDesignField, content: string) => {
    const fieldSpans = dSpans[field].filter((s) => s.end > s.start && s.start < content.length);
    if (fieldSpans.length === 0) return content;

    const points = Array.from(
      new Set(
        [0, content.length].concat(
          fieldSpans.flatMap((s) => [Math.max(0, s.start), Math.min(content.length, s.end)])
        )
      )
    ).sort((a, b) => a - b);

    return points.slice(0, -1).map((start, index) => {
      const end   = points[index + 1];
      const text  = content.slice(start, end);
      const active = fieldSpans.filter((s) => s.start < end && s.end > start);
      if (active.length === 0) return text;
      const style = active.reduce<React.CSSProperties>((merged, s) => ({
        ...merged,
        color:      s.color ?? merged.color,
        fontSize:   s.fontSize == null ? merged.fontSize : `${s.fontSize}px`,
        fontWeight: s.fontWeight ?? merged.fontWeight,
      }), {});
      return <span key={`${start}-${end}-${index}`} style={style}>{text}</span>;
    });
  }, [dSpans]);

  // ── Selectable class ──────────────────────────────────────────────────────

  const getSelectableClass = (field: SalesDesignField) =>
    selectedField === field
      ? "outline outline-1 outline-blue-400 outline-offset-2"
      : "outline outline-1 outline-transparent hover:outline-[#e6e6e6]";

  // ── Preview block ─────────────────────────────────────────────────────────

  const renderPreviewBlock = (
    field: SalesDesignField,
    content: string,
    className = "",
    extraStyle?: React.CSSProperties
  ) => {
    const fs = dStyles[field];
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => { setSelectedField(field); textSelectionRef.current = null; }}
        onContextMenu={(e) => {
          e.preventDefault();
          setSelectedField(field);
          textSelectionRef.current = null;
          setContextMenu({ field, x: e.clientX, y: e.clientY });
        }}
        className={`${getSelectableClass(field)} cursor-pointer rounded-[2px] ${className}`}
        style={{ color: fs.color, fontSize: `${fs.fontSize}px`, fontWeight: fs.fontWeight, ...extraStyle }}
      >
        {renderStyledText(field, content || " ")}
      </div>
    );
  };

  const designFields: Array<{ key: SalesDesignField; label: string }> = [
    { key: "companyName", label: "Company Name" },
    { key: "address1",    label: "Address 1"    },
    { key: "address2",    label: "Address 2"    },
    { key: "tel",         label: "Tel"          },
    { key: "gst",         label: "GST"          },
    { key: "payableName", label: "Payable Name" },
  ];

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-[#f0efed] px-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#8f8983] transition hover:bg-[#f6f5f4] hover:text-[#111] md:hidden"
          >
            <Menu size={16} />
          </button>
          <span className="text-[13px] font-semibold text-[#111]">Sales Order Design</span>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Aside: controls */}
          <aside className="hide-scrollbar h-full w-[300px] shrink-0 overflow-y-auto border-r border-[#e6e6e6] bg-white">
            {/* Save / Reset */}
            <div className="border-b border-[#e6e6e6] px-4 py-4">
              <p className="text-[11px] text-[#8f8983]">
                Edit the company header shown on the A4 preview.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-8 items-center justify-center gap-1.5 rounded-[7px] border border-[#e6e6e6] text-[12px] text-[#8f8983] transition hover:bg-[#f6f5f4]"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className={`flex h-8 items-center justify-center gap-1.5 rounded-[7px] text-[12px] text-white transition ${
                    isSaving ? "bg-[#16a34a]" : "bg-[#0075de] hover:bg-[#0062b8]"
                  }`}
                >
                  <Save size={12} />
                  {isSaving ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="divide-y divide-[#f0efed]">
              {designFields.map(({ key, label }) => (
                <div key={key} className="px-4 py-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#111]">{label}</span>
                    <SalesDesignColorPicker
                      value={styles[key].color}
                      onChange={(color) => applyColor(color, key)}
                    />
                  </div>
                  <input
                    type="text"
                    value={texts[key]}
                    onFocus={(e)      => rememberSelection(key, e.currentTarget)}
                    onClick={(e)      => rememberSelection(key, e.currentTarget)}
                    onSelect={(e)     => rememberSelection(key, e.currentTarget)}
                    onKeyUp={(e)      => rememberSelection(key, e.currentTarget)}
                    onMouseUp={(e)    => rememberSelection(key, e.currentTarget)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      rememberSelection(key, e.currentTarget);
                      setContextMenu({ field: key, x: e.clientX, y: e.clientY });
                    }}
                    onChange={(e) => updateText(key, e.target.value)}
                    className="h-9 w-full rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[13px] text-[#111] outline-none transition focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {salesDesignFontSizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`h-6 min-w-[26px] rounded border px-1 text-[10px] font-medium tabular-nums transition ${
                          styles[key].fontSize === size
                            ? "border-[#0075de] bg-[#0075de] text-white"
                            : "border-[#e6e6e6] bg-white text-[#8f8983] hover:bg-[#f6f5f4]"
                        }`}
                        onClick={() => applyFontSize(size, key)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main: A4 preview */}
          <main className="hide-scrollbar min-h-0 flex-1 overflow-auto bg-[#f6f5f4] px-4 py-4 sm:px-6">
            <div className="mx-auto w-full max-w-[920px] overflow-x-auto">
              <div className="mx-auto flex aspect-[210/297] min-w-[720px] flex-col bg-white px-[6.5%] py-[5.5%] text-black shadow-sm ring-1 ring-[#e6e6e6] [font-family:Arial,Helvetica,sans-serif] md:min-w-0">

                {/* Company header */}
                <div className="mx-auto w-[74%] text-[1.55vw] leading-tight md:text-[12px]">
                  {renderPreviewBlock("companyName", dTexts.companyName, "uppercase")}
                  {renderPreviewBlock("address1",    dTexts.address1)}
                  {renderPreviewBlock("address2",    dTexts.address2)}

                  {/* TEL line */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setSelectedField("tel"); textSelectionRef.current = null; }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedField("tel");
                      textSelectionRef.current = null;
                      setContextMenu({ field: "tel", x: e.clientX, y: e.clientY });
                    }}
                    className={`${getSelectableClass("tel")} cursor-pointer rounded-[2px]`}
                    style={{ color: dStyles.tel.color, fontSize: `${dStyles.tel.fontSize}px`, fontWeight: dStyles.tel.fontWeight }}
                  >
                    <span>TEL: </span>
                    {renderStyledText("tel", dTexts.tel || " ")}
                  </div>

                  {/* GST line */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setSelectedField("gst"); textSelectionRef.current = null; }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedField("gst");
                      textSelectionRef.current = null;
                      setContextMenu({ field: "gst", x: e.clientX, y: e.clientY });
                    }}
                    className={`${getSelectableClass("gst")} cursor-pointer rounded-[2px]`}
                    style={{ color: dStyles.gst.color, fontSize: `${dStyles.gst.fontSize}px`, fontWeight: dStyles.gst.fontWeight }}
                  >
                    <span className="font-bold">GST ID No :</span>{" "}
                    {renderStyledText("gst", dTexts.gst || " ")}
                  </div>
                </div>

                {/* Divider */}
                <div className="mt-[2.2%] border-t border-black" />

                {/* Customer box + order meta */}
                <div className="relative mt-[2%] grid grid-cols-[57%_43%] gap-[3%] text-[1.58vw] leading-tight md:text-[13px]">
                  <div>
                    <h2 className="absolute left-1/2 top-[2%] -translate-x-1/2 text-[2.65vw] font-extrabold uppercase leading-none md:text-[23px]">
                      SALES ORDER
                    </h2>
                    <div className="relative mt-[8%] h-[14.4vw] max-h-[126px] min-h-[95px] px-[3%] py-[1.5%]">
                      <div className="absolute left-0 top-0 h-[22%] w-[7%] border-l border-t border-black" />
                      <div className="absolute right-0 top-0 h-[22%] w-[7%] border-r border-t border-black" />
                      <div className="absolute bottom-0 left-0 h-[22%] w-[7%] border-b border-l border-black" />
                      <div className="absolute bottom-0 right-0 h-[22%] w-[7%] border-b border-r border-black" />
                      <div className="pt-[1%]">
                        <div>EXAMPLE CUSTOMER SDN BHD</div>
                        <div className="mt-[1%]">SAMPLE CONTACT PERSON</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative min-h-[calc(14.4vw+34px)] md:min-h-[160px]">
                    <div className="absolute left-[36%] right-0 top-[2.2%] grid grid-cols-[36px_10px_1fr] items-baseline text-[1.85vw] font-bold leading-none md:text-[16px]">
                      <span>No.</span>
                      <span>:</span>
                      <span>SO-TEST-0001</span>
                    </div>
                    <div className="absolute left-[7%] right-0 top-[22%] flex h-[12.2vw] max-h-[106px] min-h-[80px] flex-col justify-between">
                      {[
                        ["Your Ref No.", ""],
                        ["Our Ref No.",  ""],
                        ["Terms",        "C.O.D."],
                        ["Date",         "01/01/2026"],
                        ["Page",         "1 of 1"],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[92px_12px_1fr]">
                          <span>{label}</span>
                          <span>:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items table */}
                <div className="mt-[1.6%] border-t border-black text-[1.4vw] md:text-[12px]">
                  <div className="grid grid-cols-[7%_44%_8%_8%_11%_7%_15%] py-[0.4%] text-center">
                    <span>Item</span>
                    <span>Description</span>
                    <span>Qty</span>
                    <span>UOM</span>
                    <span>U/ Price</span>
                    <span>Disc.</span>
                    <span>Total</span>
                  </div>
                  <div className="grid grid-cols-[7%_44%_8%_8%_11%_7%_15%] border-b border-black pb-[0.7%] text-center">
                    <span /><span /><span /><span />
                    <span>RM</span>
                    <span />
                    <span>RM</span>
                  </div>
                  <div className="grid min-h-[53vw] max-h-[560px] grid-cols-[7%_44%_8%_8%_11%_7%_15%] pt-[0.8%] md:min-h-[540px]">
                    <div className="pt-[0.2%] text-center">1.</div>
                    <div className="pr-[4%]">
                      <div>SAMPLE PRODUCT FOR SALES ORDER TEMPLATE</div>
                      <div className="mt-[1.5%] text-[1.02vw] font-bold md:text-[9px]">SAMPLE SPECIFICATION:</div>
                      <div className="mt-[0.7%] text-[1.02vw] font-bold text-blue-600 md:text-[9px]">SAMPLE SECTION A:</div>
                      <div className="text-[1.05vw] leading-tight md:text-[9.5px]">
                        Sample description line 1<br />
                        Sample description line 2<br />
                        Sample description line 3
                      </div>
                      <div className="mt-[0.7%] text-[1.02vw] font-bold text-blue-600 md:text-[9px]">SAMPLE SECTION B</div>
                      <div className="text-[1.05vw] leading-tight md:text-[9.5px]">
                        Sample detail line 4<br />
                        Sample detail line 5
                      </div>
                      <div className="mt-[0.7%] text-[1.02vw] font-bold text-blue-600 md:text-[9px]">SAMPLE SECTION C:</div>
                      <div className="text-[1.05vw] leading-tight md:text-[9.5px]">
                        Sample detail line 6 with longer placeholder text
                      </div>
                      <div className="mt-[2.8%] text-[1.02vw] font-bold text-blue-600 md:text-[9px]">SAMPLE OTHER INFORMATION:</div>
                      <div className="text-[1.05vw] leading-tight md:text-[9.5px]">
                        Sample note line 7<br />
                        Sample note line 8<br />
                        Sample note line 9<br />
                        Sample note line 10<br />
                        Sample note line 11
                      </div>
                    </div>
                    <div className="text-center">2</div>
                    <div className="text-center">UNIT</div>
                    <div className="text-right">1,250.00</div>
                    <div />
                    <div className="text-right">
                      <div>2,500.00</div>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-auto border-t border-black pt-[1.5%] text-[1.25vw] md:text-[11px]">
                  <div className="grid grid-cols-[1fr_43%] items-start gap-[4%]">
                    <div className="pt-[0.8%] text-[1.55vw] uppercase md:text-[14px]">
                      RINGGIT&nbsp;MALAYSIA
                    </div>
                    <div className="space-y-[2.1%] text-[1.55vw] font-extrabold leading-none md:text-[14px]">
                      {[
                        ["Sub Total (Excluding Tax)", "2,500.00"],
                        ["Tax @ 0% on 0.00",          "0.00"],
                        ["Total (Inclusive of Tax)",   "2,500.00"],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[1fr_36%] items-center gap-[1.5%]">
                          <span className="text-right">{label}</span>
                          <span className="h-[24px] border-2 border-black px-2 text-right leading-[20px]">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes: payableName */}
                <div className="mt-[6.5%] border-t border-black pt-[1.2%] text-[1.35vw] leading-[1.35] md:text-[12px]">
                  <div>Notes :</div>
                  <div className="mt-[0.35%] grid grid-cols-[16px_1fr]">
                    <span>1.</span>
                    <span>All cheques should be crossed and made payable to</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setSelectedField("payableName"); textSelectionRef.current = null; }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedField("payableName");
                      textSelectionRef.current = null;
                      setContextMenu({ field: "payableName", x: e.clientX, y: e.clientY });
                    }}
                    className={`${getSelectableClass("payableName")} ml-[16px] mt-[0.55%] block max-w-[92%] cursor-pointer whitespace-nowrap`}
                    style={{
                      color:      dStyles.payableName.color,
                      fontSize:   `${dStyles.payableName.fontSize}px`,
                      fontWeight: dStyles.payableName.fontWeight,
                      lineHeight: `${getMaxFontSize(dStyles.payableName.fontSize, dSpans.payableName) * 1.4}px`,
                    }}
                  >
                    {renderStyledText("payableName", dTexts.payableName || " ")}
                  </div>
                </div>

                {/* Authorised Signature */}
                <div className="mt-[9.5%] w-[39%] border-t-2 border-black pt-[1.2%] text-center text-[1.45vw] font-extrabold md:text-[13px]">
                  Authorised Signature
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[200px] overflow-hidden rounded-[10px] border border-[#e6e6e6] bg-white py-1 shadow-[0_12px_28px_rgba(15,15,15,0.14)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8f8983]">
            Apply to {fieldLabels[contextMenu.field]}
          </div>
          <div className="mx-2 my-1 border-t border-[#f0efed]" />
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8f8983]">
            Text color
          </div>
          <div className="grid grid-cols-4 gap-1 px-3 pb-2">
            {salesDesignColorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                className="flex h-7 items-center gap-1.5 rounded px-1 text-[11px] text-[#111] hover:bg-[#f6f5f4]"
                onClick={() => { applyColor(opt.value, contextMenu.field); setContextMenu(null); }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-[#e6e6e6]"
                  style={{ backgroundColor: opt.value }}
                />
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mx-2 my-1 border-t border-[#f0efed]" />
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8f8983]">
            Font size
          </div>
          <div className="grid grid-cols-5 gap-1 px-3 pb-2">
            {salesDesignFontSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                className={`h-7 rounded border px-1 text-[11px] tabular-nums transition ${
                  styles[contextMenu.field].fontSize === size
                    ? "border-[#0075de] bg-[#0075de] text-white"
                    : "border-[#e6e6e6] text-[#111] hover:bg-[#f6f5f4]"
                }`}
                onClick={() => { applyFontSize(size, contextMenu.field); setContextMenu(null); }}
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
