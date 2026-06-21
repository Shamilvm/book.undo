"use client";

import { useEffect, useRef, useState } from "react";
import BookDialog from "@/components/admin/BookDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  approveBook,
  deleteBook,
  formatApprovalStatus,
  formatDate,
  getAdminBooks,
  isSuperAdmin,
  type AdminBook,
  type ApprovalStatus,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

export default function AdminBooksPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminBook>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminBook | null>(null);
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

    function badge(status: string) {
      return `<span class="status-badge ${status}">${formatApprovalStatus(status as ApprovalStatus)}</span>`;
    }

    function row(book: AdminBook) {
      const extra = `
        ${book.approvalStatus !== "approved" ? adminActionBtn("approve", "Approve", "primary") : ""}
        ${book.approvalStatus !== "rejected" ? adminActionBtn("reject", "Reject") : ""}
      `;
      return `<tr data-id="${book._id}">
      <td><strong>${book.coverEmoji} ${book.title}</strong><br><span class="muted">${book.author}</span></td>
      <td>${book.donorName}${book.donorContact ? `<br><span class="muted">${book.donorContact}</span>` : ""}</td>
      <td>${book.location}, ${book.district}</td>
      <td>${book.status}</td>
      <td>${badge(book.approvalStatus)}<br><span class="muted">${formatDate(book.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = filter.value as "" | ApprovalStatus;
      const books = await getAdminBooks(status || undefined);
      itemsRef.current = new Map(books.map((b) => [b._id, b]));
      tbody.innerHTML = books.map(row).join("");
      empty.hidden = books.length > 0;
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
        const book = itemsRef.current.get(id);
        if (book) {
          setDialogItem(book);
          setDialogOpen(true);
        }
        return;
      }

      if (action === "delete" && !confirm("Delete this book permanently?"))
        return;

      try {
        if (action === "approve") await approveBook(id, "approved");
        else if (action === "reject") await approveBook(id, "rejected");
        else if (action === "delete") await deleteBook(id);
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
        <h1>Physical books</h1>
        <p>Approve donated books or remove listings from the platform.</p>
      </div>

      <div className="admin-toolbar">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setDialogItem(null);
            setDialogOpen(true);
          }}
        >
          Add book
        </button>
        <SelectField id="filter" ref={filterRef} defaultValue="">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Donor</th>
              <th>Location</th>
              <th>Status</th>
              <th>Approval</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No books match this filter.
        </p>
      </div>

      <BookDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
