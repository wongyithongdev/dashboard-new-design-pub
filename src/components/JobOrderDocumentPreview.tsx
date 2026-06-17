"use client";

import React from "react";

// Local type definitions (no API dependency)
export type JobOrderDesignSpan = {
  start: number;
  end: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
};

export type JobOrderDesignBlock = {
  visible: boolean;
  text: string;
  fontSize: number;
  fontWeight: string | number;
  alignment: string;
  color: string;
  spans: JobOrderDesignSpan[];
};

export type JobOrderDesignLogo = {
  visible?: boolean;
  url?: string;
  imageUrl?: string;
  width?: number;
};

export type JobOrderDesignPayload = {
  schemaVersion?: number;
  documentType?: string;
  logo?: JobOrderDesignLogo;
  blocks?: Record<string, JobOrderDesignBlock>;
};

export type JobOrderDocumentBlockKey = "companyName" | "address" | "contact";

export type JobOrderDocumentPreviewItem = {
  lineNo?: number;
  itemCode?: string;
  description?: string;
  furtherDescription?: string;
  uom?: string;
  qty?: number | string;
  unitPrice?: number | string;
  subtotal?: number | string;
  subTotal?: number | string;
  total?: number | string;
};

export type JobOrderDocumentPreviewData = {
  ref?: string;
  date?: string;
  customerName?: string;
  phone?: string;
  company?: string;
  companyCode?: string;
  debtorType?: string;
  addressLines?: string[];
  note?: string;
  agentNote?: string;
  startDate?: string;
  completeDate?: string;
  jobOrderDescription?: string;
  serviceType?: string;
  serviceItem?: string;
  serialNo?: string;
  furtherDescription?: string;
  items?: JobOrderDocumentPreviewItem[];
  itemsTotal?: number;
  serviceCharge?: number;
  total?: number;
};

type JobOrderDocumentPreviewProps = {
  design: JobOrderDesignPayload;
  data?: JobOrderDocumentPreviewData;
  zoom?: number;
  className?: string;
  paperClassName?: string;
  paperRef?: React.Ref<HTMLDivElement>;
  renderLogo?: (defaultLogo: React.ReactNode) => React.ReactNode;
  renderBlock?: (
    field: JobOrderDocumentBlockKey,
    content: string,
    className: string,
    style: React.CSSProperties,
    block: JobOrderDesignBlock
  ) => React.ReactNode;
};

const defaultBlock: JobOrderDesignBlock = {
  visible: true,
  text: "",
  fontSize: 10,
  fontWeight: "normal",
  alignment: "left",
  color: "#111111",
  spans: [],
};

function getBlock(design: JobOrderDesignPayload, key: JobOrderDocumentBlockKey) {
  return design.blocks?.[key] ?? defaultBlock;
}

function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);
  return `RM ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
}

function formatLineValue(value: unknown) {
  return value == null || value === "" ? "" : String(value);
}

function renderStyledText(block: JobOrderDesignBlock) {
  const content = block.text || "";
  const spans = (block.spans || []).filter(
    (span) => span.end > span.start && span.start < content.length
  );
  if (spans.length === 0) return content;

  const points = Array.from(
    new Set(
      [0, content.length].concat(
        spans.flatMap((span) => [
          Math.max(0, span.start),
          Math.min(content.length, span.end),
        ])
      )
    )
  ).sort((l, r) => l - r);

  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const activeStyle = spans.reduce<{
      color?: string;
      fontSize?: number;
      fontWeight?: string | number;
    }>((style, span) => {
      if (span.start <= start && span.end >= end) {
        return {
          color: span.color ?? style.color,
          fontSize: span.fontSize ?? style.fontSize,
          fontWeight: span.fontWeight ?? style.fontWeight,
        };
      }
      return style;
    }, {});

    return (
      <span
        key={`${start}-${end}`}
        style={{
          color: activeStyle.color,
          fontSize: activeStyle.fontSize ? `${activeStyle.fontSize}px` : undefined,
          fontWeight: activeStyle.fontWeight,
        }}
      >
        {content.slice(start, end)}
      </span>
    );
  });
}

function InlineLine({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <span>{label}</span>
      <span className="min-h-[20px] border-b border-black px-1">
        <span>{value || " "}</span>
      </span>
    </>
  );
}

function DateTimeSelectBox({ value }: { value?: string }) {
  return (
    <div className="flex h-full items-center px-2 text-[12px] text-black">
      <span>{value || " "}</span>
    </div>
  );
}

export function JobOrderDocumentPreview({
  design,
  data,
  zoom = 1,
  className = "",
  paperClassName = "",
  paperRef,
  renderLogo,
  renderBlock,
}: JobOrderDocumentPreviewProps) {
  const companyNameBlock = getBlock(design, "companyName");
  const addressBlock     = getBlock(design, "address");
  const contactBlock     = getBlock(design, "contact");
  const logoUrl    = design.logo?.imageUrl || design.logo?.url || "";
  const logoWidth  = Number(design.logo?.width || 120);
  const items      = data?.items ?? [];
  const rows       = Array.from({ length: Math.max(9, items.length) }, (_, i) => items[i]);
  const total      = data?.total ?? Number(data?.itemsTotal || 0) + Number(data?.serviceCharge || 0);
  const company    = data?.company || "";
  const addressLines = (data?.addressLines || []).map((l) => String(l || "").trim()).filter(Boolean);
  const compactAddressLines =
    addressLines.length > 2
      ? [
          addressLines.slice(0, Math.ceil(addressLines.length / 2)).join(", "),
          addressLines.slice(Math.ceil(addressLines.length / 2)).join(", "),
        ]
      : addressLines;
  const itemFurtherDescription = data?.furtherDescription || "";

  const renderTextBlock = (
    field: JobOrderDocumentBlockKey,
    block: JobOrderDesignBlock,
    classNameValue: string,
    lineHeight: number
  ) => {
    if (!block.visible) return null;
    const style: React.CSSProperties = {
      fontSize: `${block.fontSize}px`,
      fontWeight: block.fontWeight,
      color: block.color,
      lineHeight,
      textAlign: block.alignment as React.CSSProperties["textAlign"],
    };
    if (renderBlock) {
      return renderBlock(field, block.text, classNameValue, style, block);
    }
    return (
      <div className={classNameValue} style={style}>
        {renderStyledText(block)}
      </div>
    );
  };

  const defaultLogo = logoUrl ? (
    <img
      src={logoUrl}
      alt="Company logo"
      className="h-auto object-contain"
      style={{ width: `${logoWidth}px`, maxWidth: "100%" }}
    />
  ) : (
    <span>
      <span className="block text-[40px] font-black leading-none tracking-tight text-zinc-900">
        LOGO
      </span>
    </span>
  );

  return (
    <div
      className={`mx-auto ${className}`}
      style={{ width: `${920 * zoom}px`, minHeight: `${1360 * zoom}px` }}
    >
      <div
        ref={paperRef}
        className={`w-[920px] origin-top-left bg-white px-8 py-8 text-black shadow-[0_18px_50px_rgba(15,23,42,0.16)] [font-family:Arial,Helvetica,sans-serif] ${paperClassName}`}
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Header: logo + company info + ref/date */}
        <div className="grid grid-cols-[190px_1fr_250px] items-center gap-8">
          <div className="flex min-h-[92px] items-center justify-center text-center">
            {renderLogo ? renderLogo(defaultLogo) : defaultLogo}
          </div>
          <div className="flex min-h-[92px] flex-col justify-center">
            {renderTextBlock("companyName", companyNameBlock, "whitespace-pre-wrap break-words tracking-wide", 1.35)}
            <div className="mt-2 space-y-1.5">
              {renderTextBlock("address", addressBlock, "whitespace-pre-wrap break-words", 1.45)}
              {renderTextBlock("contact", contactBlock, "whitespace-pre-wrap break-words", 1.45)}
            </div>
          </div>
          <div className="text-[14px]">
            <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-2 gap-y-3">
              <span className="whitespace-nowrap">REF. :</span>
              <span className="min-h-[20px] border-b border-black px-1">
                <span>{data?.ref || " "}</span>
              </span>
              <span className="whitespace-nowrap">DATE :</span>
              <span className="min-h-[20px] border-b border-black px-1">
                <span>{data?.date || " "}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="mt-12 grid grid-cols-[80px_1fr_90px_180px] items-end gap-4 text-[14px]">
          <InlineLine label="To / From :" value={data?.customerName} />
          <InlineLine label="Contact (Tel) :" value={data?.phone} />
          <InlineLine label="Company :" value={company} />
          <InlineLine label="Debtor Type :" value={data?.debtorType} />
          <span>Address :</span>
          <span className="col-span-3 min-h-[20px] whitespace-pre-wrap border-b border-black px-1">
            <span>{compactAddressLines[0] || " "}</span>
          </span>
          <span />
          <span className="col-span-3 min-h-[20px] whitespace-pre-wrap border-b border-black px-1">
            <span>{compactAddressLines[1] || " "}</span>
          </span>
        </div>

        {/* Items table */}
        <table className="mt-4 w-full table-fixed border-collapse text-[13px]">
          <thead>
            <tr className="h-[30px] bg-zinc-100">
              <th className="w-12 border border-black px-2 py-1 font-normal">No.</th>
              <th className="border border-black px-2 py-1 font-normal">Description</th>
              <th className="w-28 border border-black px-2 py-1 font-normal">Unit Price</th>
              <th className="w-16 border border-black px-2 py-1 font-normal">Qty</th>
              <th className="w-[120px] border border-black px-2 py-1 font-normal">Sub-Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={`${item?.lineNo ?? index}-${item?.itemCode ?? "blank"}`} className="h-[32px]">
                <td className="border border-black px-2 py-0.5 text-center leading-tight">
                  {item ? item.lineNo || index + 1 : index + 1}
                </td>
                <td className="border border-black px-2 py-0.5 leading-tight">
                  {item ? (
                    <div className="max-w-full truncate" title={item.description || "-"}>
                      {item.description || "-"}
                    </div>
                  ) : (
                    " "
                  )}
                </td>
                <td className="border border-black px-2 py-0.5 text-right leading-tight">
                  {item ? formatMoney(item.unitPrice) : " "}
                </td>
                <td className="border border-black px-2 py-0.5 text-center leading-tight">
                  {item ? formatLineValue(item.qty) || "-" : " "}
                </td>
                <td className="border border-black px-2 py-0.5 text-right leading-tight">
                  {item ? formatMoney(item.subtotal ?? item.subTotal ?? item.total) : " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Equipment info */}
        <div className="border-x border-b border-black px-2 py-2 text-[13px]">
          <div className="grid grid-cols-[auto_1fr] items-end gap-2 py-1">
            <span>EQUIPMENT TYPE SEND IN / COLLECTED:</span>
            <span className="border-b border-black px-1">
              <span>{data?.serviceItem || " "}</span>
            </span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-end gap-2 py-1">
            <span>Serial No:</span>
            <span className="border-b border-black px-1">
              <span>{data?.serialNo || " "}</span>
            </span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-2 py-1">
            <span>Condition Noted Upon Intake:</span>
            <span className="min-h-[18px] whitespace-pre-wrap border-b border-black px-1">
              <span>{itemFurtherDescription || " "}</span>
            </span>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-[1fr_260px] border-x border-b border-black text-[14px]">
          <div className="min-h-20 px-3 py-2">Remark</div>
          <div className="grid grid-rows-[28px_28px_38px] border-l border-black">
            <div className="grid grid-cols-[150px_1fr] border-b border-black">
              <div className="flex items-center justify-end whitespace-nowrap border-r border-black px-3">Total Item</div>
              <div className="flex items-center justify-end px-3">{formatMoney(data?.itemsTotal)}</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-black">
              <div className="flex items-center justify-end whitespace-nowrap border-r border-black px-3">Service Charge</div>
              <div className="flex items-center justify-end px-3">{formatMoney(data?.serviceCharge)}</div>
            </div>
            <div className="grid grid-cols-[96px_1fr]">
              <div className="flex items-center justify-end border-r border-black px-3">Total</div>
              <div className="flex items-center justify-end px-3">{formatMoney(total)}</div>
            </div>
          </div>
        </div>

        {/* Service note */}
        <div className="border-x border-b border-black text-[14px]">
          <div className="border-b border-black bg-zinc-100 px-2 py-1 font-bold">
            SERVICE NOTE &amp; CUSTOMER REQUESTS
          </div>
          <div className="min-h-[84px] whitespace-pre-wrap px-2 py-2">{data?.note || " "}</div>
        </div>

        {/* Diagnostic + dates */}
        <div className="grid grid-cols-[1fr_320px] border-x border-b border-black text-[13px]">
          <div className="min-h-[132px] border-r border-black bg-zinc-100 px-2 py-2">
            <div className="font-bold">Diagnostic Results, Actions Taken &amp; Technician Comments</div>
            {data?.agentNote ? (
              <div className="mt-3 whitespace-pre-wrap font-normal">{data.agentNote}</div>
            ) : null}
          </div>
          <div className="grid grid-rows-2">
            <div className="grid grid-cols-[190px_1fr] border-b border-black">
              <div className="flex items-center border-r border-black px-3 italic">START DATE &amp; TIME</div>
              <DateTimeSelectBox value={data?.startDate} />
            </div>
            <div className="grid grid-cols-[190px_1fr]">
              <div className="flex items-center border-r border-black px-3 italic">COMPLETE DATE &amp; TIME</div>
              <DateTimeSelectBox value={data?.completeDate} />
            </div>
          </div>
        </div>

        {/* Case close */}
        <div className="border-x border-b border-black px-4 py-6 text-right text-[13px]">
          Case Close &amp; Job Complete :&nbsp;&nbsp;[&nbsp; Yes&nbsp; ]&nbsp;&nbsp;[&nbsp; No&nbsp; ]
        </div>

        {/* Signatures */}
        <div className="mt-14 grid grid-cols-3 gap-20 px-8 text-center text-[14px]">
          <div>
            <div className="border-b border-black">&nbsp;</div>
            <div className="mt-2">For Ants Micro Computer</div>
          </div>
          <div>
            <div className="border-b border-black">&nbsp;</div>
            <div className="mt-2">For Transporter</div>
          </div>
          <div>
            <div className="border-b border-black">&nbsp;</div>
            <div className="mt-2">Customer | Enduser</div>
          </div>
        </div>
      </div>
    </div>
  );
}
