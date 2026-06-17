"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  Ellipsis,
  Hash,
  Menu,
  PackageCheck,
  Plus,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

type Equipment = {
  id: string;
  name: string;
  description: string;
  updatedAt: Date;
};

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: "1",
    name: "Laptop Dell XPS 15",
    description: "Received from client for repair. Screen flickering issue reported on startup.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "2",
    name: "Canon Printer MF445dw",
    description: "Paper jam and faded print quality. Brought in for maintenance service.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
  {
    id: "3",
    name: "UPS APC 1500VA",
    description: "Battery replacement required. Unit no longer holding charge.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
  },
];

function formatUpdatedAt(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

type DrawerMode = "create" | "edit";

function EquipmentDrawer({
  mode,
  equipment,
  onClose,
  onCreate,
  onSave,
}: {
  mode: DrawerMode;
  equipment: Equipment | null;
  onClose: () => void;
  onCreate: (name: string, desc: string) => void;
  onSave: (id: string, name: string, desc: string) => void;
}) {
  const [name, setName] = useState(equipment?.name ?? "");
  const [desc, setDesc] = useState(equipment?.description ?? "");

  const isEdit = mode === "edit";
  const canSubmit = name.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    if (isEdit && equipment) {
      onSave(equipment.id, name.trim(), desc.trim());
    } else {
      onCreate(name.trim(), desc.trim());
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
        <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">
          {isEdit ? "Edit equipment" : "Add equipment"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]"
        >
          <X size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#8f8983]">
            Equipment name <span className="text-[#f87171]">*</span>
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="e.g. Laptop Dell XPS 15"
            className="h-9 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 text-[14px] text-[#2c2c2b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-[#c5c0bb] transition focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#8f8983]">
            Description
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the condition or issue of the equipment…"
            rows={5}
            className="w-full resize-none rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2.5 text-[14px] leading-relaxed text-[#2c2c2b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-[#c5c0bb] transition focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[#e6e6e6] px-7 py-5">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 items-center rounded-[7px] border border-[#e6e6e6] bg-white px-3.5 text-[13px] font-medium text-[#615d59] transition-colors duration-75 hover:bg-[#f6f5f4]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex h-8 items-center rounded-[7px] bg-[#0075de] px-3.5 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.22)] transition-colors duration-75 hover:bg-[#0b83ea] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? "Save changes" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function EquipmentReceivedPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const shouldReduceMotion = useReducedMotion();

  function openCreate() {
    setEditingItem(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  function openEdit(item: Equipment) {
    setEditingItem(item);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
  }

  function handleCreate(name: string, desc: string) {
    setItems((prev) => [
      { id: String(Date.now()), name, description: desc, updatedAt: new Date() },
      ...prev,
    ]);
    closeDrawer();
  }

  function handleSave(id: string, name: string, desc: string) {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, name, description: desc, updatedAt: new Date() } : n
      )
    );
    closeDrawer();
  }

  const columns = [
    { label: "Equipment Name", icon: PackageCheck, width: "w-[320px]" },
    { label: "Description",    icon: Hash,         width: undefined    },
    { label: "Updated",        icon: null,         width: "w-[120px]" },
    { label: "Action",         icon: null,         width: "w-[100px]" },
  ] as const;

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
          <section className="flex min-h-screen flex-col">

            {/* Header */}
            <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
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
                  Equipment Received
                </h1>
              </div>
              <div aria-hidden="true" />
            </header>

            {/* Toolbar */}
            <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between gap-3 px-[var(--dashboard-main-x)]">
              <p className="text-[13px] text-[#a39e98]">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
              <button
                type="button"
                onClick={drawerOpen ? closeDrawer : openCreate}
                className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${
                  drawerOpen
                    ? "bg-[#e8453c] text-white shadow-[0_1px_1px_rgba(232,69,60,0.18)] hover:bg-[#d63c34]"
                    : "bg-[#2783DE] text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] hover:bg-[#1f76c9]"
                }`}
              >
                {drawerOpen ? (
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Plus size={13} strokeWidth={1.9} aria-hidden="true" />
                )}
                {drawerOpen ? "Dismiss" : "Add equipment"}
              </button>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            {/* Table */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex size-11 items-center justify-center rounded-[12px] bg-[#f6f5f4] text-[#c5c0bb]">
                  <PackageCheck size={22} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#2c2c2b]">No equipment recorded</p>
                  <p className="mt-0.5 text-[13px] text-[#8f8983]">Add the first received equipment entry.</p>
                </div>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-1 flex h-8 items-center gap-1.5 rounded-[8px] bg-[#0075de] px-3.5 text-[13px] font-medium text-white transition-colors duration-75 hover:bg-[#0b83ea]"
                >
                  <Plus size={14} strokeWidth={2.2} />
                  Add equipment
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto px-[var(--dashboard-main-x)]">
                <table className="w-full table-fixed border-separate border-spacing-0 text-left">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {columns.map((col, colIdx) => {
                        const Icon = col.icon;
                        const isFirst  = colIdx === 0;
                        const isLast   = colIdx === columns.length - 1;
                        const isAction = col.label === "Action";
                        const padding  = isFirst ? "pl-6 pr-3" : isLast ? "pl-3 pr-6" : "px-3";
                        return (
                          <th
                            key={col.label}
                            scope="col"
                            className={`${col.width ?? ""} h-[var(--dashboard-head-h)] border-b ${isLast ? "" : "border-r"} border-[#e6e6e6] ${padding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${isAction ? "text-right" : ""}`}
                          >
                            <span className={`flex items-center gap-1.5 ${isAction ? "justify-end" : ""}`}>
                              {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />}
                              {col.label}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        animate={{ opacity: 1, x: 0 }}
                        className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : index * 0.055,
                          duration: shouldReduceMotion ? 0 : 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <td className="border-b border-r border-[#f0efed] pl-6 pr-3 text-[14px] font-medium leading-5 text-[#2c2c2b]">
                          <span className="inline-flex min-w-0 items-center gap-2">
                            <PackageCheck size={15} strokeWidth={1.7} className="shrink-0 text-[#b5b0aa]" aria-hidden="true" />
                            <span className="truncate">{item.name}</span>
                          </span>
                        </td>

                        <td className="border-b border-r border-[#f0efed] px-3 text-[13.5px] leading-5 text-[#6f6a64]">
                          <span className="line-clamp-1">
                            {item.description || <span className="text-[#c5c0bb]">No description</span>}
                          </span>
                        </td>

                        <td className="border-b border-r border-[#f0efed] px-3 text-[13px] tabular-nums text-[#b5b0aa]">
                          {formatUpdatedAt(item.updatedAt)}
                        </td>

                        <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setItems((prev) => prev.filter((n) => n.id !== item.id))}
                              className="inline-flex h-7 items-center rounded-[7px] border border-transparent px-2 text-[14px] font-medium leading-5 text-[#c2410c] outline-none transition-colors duration-75 hover:border-[#fca5a5] hover:bg-[#fff5f5] focus-visible:border-[#fca5a5] focus-visible:bg-[#fff5f5] focus-visible:ring-2 focus-visible:ring-[#fca5a5]/20"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              aria-label={`Edit ${item.name}`}
                              onClick={() => openEdit(item)}
                              className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                            >
                              <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>
        </main>

        {/* Right side drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.aside
              key="equipment-drawer"
              className="relative shrink-0 overflow-hidden border-l border-[#e6e6e6] bg-white"
              style={{ height: "100vh", position: "sticky", top: 0 }}
              initial={{ width: 0 }}
              animate={{ width: 440 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex h-full w-[440px] flex-col">
                <EquipmentDrawer
                  key={editingItem?.id ?? "create"}
                  mode={drawerMode}
                  equipment={editingItem}
                  onClose={closeDrawer}
                  onCreate={handleCreate}
                  onSave={handleSave}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
