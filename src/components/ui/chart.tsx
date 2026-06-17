"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

export type ChartConfig = Record<string, { label?: string; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within ChartContainer");
  return ctx;
}

function ChartContainer({
  config,
  children,
  className,
}: {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}) {
  const cssVars = Object.fromEntries(
    Object.entries(config).map(([k, v]) => [`--color-${k}`, v.color ?? ""])
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className} style={cssVars}>
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
}: RechartsPrimitive.TooltipProps<number, string> & { hideLabel?: boolean }) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[150px] rounded-[10px] border border-[#e6e6e6] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      {!hideLabel && (
        <p className="mb-2 text-[12px] font-semibold text-[#1a1a1a]">{label}</p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => {
          const key = entry.dataKey as string;
          const cfg = config[key];
          const color = cfg?.color ?? (entry.stroke as string) ?? entry.color;
          return (
            <div key={key} className="flex items-center gap-2 border-l-2 pl-2" style={{ borderColor: color }}>
              <p className="flex-1 text-[11px] text-[#6b6b6b]">{cfg?.label ?? key}</p>
              <p className="text-[11px] font-semibold tabular-nums text-[#1a1a1a]">
                RM {Number(entry.value ?? 0).toLocaleString("en-MY")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

export { ChartContainer, ChartTooltip, ChartTooltipContent };
