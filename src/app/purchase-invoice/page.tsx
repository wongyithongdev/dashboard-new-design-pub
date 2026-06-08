import { DashboardSidebar } from "@/components/sidebar";

export default function PurchaseInvoicePage() {
  return (
    <div className="min-h-screen bg-white text-[#000000] md:flex">
      <DashboardSidebar activeItem="purchase-invoice" />
      <main className="min-h-[calc(100vh-64px)] flex-1 bg-white md:min-h-screen" />
    </div>
  );
}
