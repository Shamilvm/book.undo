"use client";

import { useEffect, useRef, useState } from "react";
import BorrowDialog from "@/components/admin/BorrowDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  deleteBorrow,
  formatDate,
  getAdminBorrows,
  isSuperAdmin,
  updateBorrowStatus,
  type AdminBook,
  type AdminBorrow,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

export default function AdminBorrowsPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminBorrow>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminBorrow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const filter = filterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;
    const superAdmin = isSuperAdmin();

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      filter.value = filterParam;
      syncSelectFieldFromNative(filter);
    }

    function bookInfo(bookId: AdminBook | string | null) {
      if (!bookId) return "Book removed";
      if (typeof bookId === "string") return bookId;
      return `${bookId.coverEmoji || "📚"} ${bookId.title} — ${bookId.author}`;
    }

    function row(req: AdminBorrow) {
      const extra = `
        ${req.status === "pending" ? adminActionBtn("approve", "Approve", "primary") : ""}
        ${req.status === "approved" ? adminActionBtn("return", "Mark returned") : ""}
        ${req.status === "pending" ? adminActionBtn("cancel", "Cancel") : ""}
      `;
      return `<tr data-id="${req._id}">
      <td>${bookInfo(req.bookId)}</td>
      <td>${req.borrowerName}<br><span class="muted">${req.borrowerContact}</span></td>
      <td>${req.message || "—"}</td>
      <td><span class="status-badge ${req.status === "pending" ? "pending" : "approved"}">${req.status}</span><br><span class="muted">${formatDate(req.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = filter.value || undefined;
      const requests = await getAdminBorrows(status);
      itemsRef.current = new Map(requests.map((r) => [r._id, r]));
      tbody.innerHTML = requests.map(row).join("");
      empty.hidden = requests.length > 0;
    }

    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-action]",
      ) as HTMLElement | null;
      if (!btn) return;
      const tr = btn.closest("tr")!;
      const id = tr.dataset.id!;
      const action = btn.dataset.action;

      if (action === "edit") {
        const req = itemsRef.current.get(id);
        if (req) {
          setDialogItem(req);
          setDialogOpen(true);
        }
        return;
      }

      if (action === "delete" && !confirm("Delete this borrow request?")) return;

      try {
        if (action === "approve") await updateBorrowStatus(id, "approved");
        else if (action === "return") await updateBorrowStatus(id, "returned");
        else if (action === "cancel") await updateBorrowStatus(id, "cancelled");
        else if (action === "delete") await deleteBorrow(id);
        await load();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
      }
    };

    tbody.addEventListener("click", onClick);
    filter.addEventListener("change", load);
    load();

    return () => {
      tbody.removeEventListener("click", onClick);
      filter.removeEventListener("change", load);
    };
  }, [refreshKey]);

  return (
    <>
      <div className="admin-header">
        <h1>Borrow requests</h1>
        <p>Approve, return, or cancel book borrow requests.</p>
      </div>

      <div className="admin-toolbar">
        <SelectField id="filter" ref={filterRef} defaultValue="">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrower</th>
              <th>Message</th>
              <th>Status</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No borrow requests match this filter.
        </p>
      </div>

      <BorrowDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
