import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import type { Trade, pagination } from "@/types";
import Search from "@/components/global/Search";
import CustomAlert from "@/components/global/CustomAlert";
import TradeTable from "@/components/trades/TradeTable";
import TradeForm from "@/components/trades/TradeForm";

const Trades = () => {
  // it's the same as users/academics-year components
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Delete Alert States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNum(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Fetch Trades
  const fetchTrades = async () => {
    try {
      setLoading(true);

      // Construct Query Params
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "10");
      if (debouncedSearch) params.append("search", debouncedSearch);

      const { data } = (await api.get(`/trades?${params.toString()}`)) as {
        data: { trades: Trade[]; pagination: pagination };
      };

      // Handle response structure { trades: [], pagination: {} }
      if (data.trades) {
        setTrades(data.trades);
        setTotalPages(data.pagination.pages);
      } else {
        setTrades([]);
      }
    } catch (error) {
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when Page or Search changes
  useEffect(() => {
    fetchTrades();
  }, [pageNum, debouncedSearch]);

  const handleCreate = () => {
    setEditingTrade(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/trades/delete/${deleteId}`);
      toast.success("Trade deleted successfully");
      fetchTrades(); // to refresh the list
    } catch (error: any) {
      toast.error("Failed to delete trade");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">
            Manage trades and trade in-charge assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Search search={search} setSearch={setSearch} title="Trades" />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Trade
          </Button>
        </div>
      </div>
      {/* table */}
      <TradeTable
        data={trades}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        page={pageNum}
        setPage={setPageNum}
        totalPages={totalPages}
      />
      {/* form */}
      <TradeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingTrade}
        onSuccess={fetchTrades}
      />
      {/* alert */}
      <CustomAlert
        handleDelete={confirmDelete}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete Trade"
        description="Are you sure you want to delete this trade? This action cannot be undone."
      />
    </div>
  );
};

export default Trades;
