"use client";

import { useEffect, useRef, useState } from "react";
import DigitalBookDialog from "@/components/admin/DigitalBookDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  approveDigitalBook,
  deleteDigitalBook,
  formatApprovalStatus,
  formatDate,
  getAdminDigitalBooks,
  isSuperAdmin,
  type ApprovalStatus,
  type DigitalBook,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

export default function AdminDigitalBooksPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, DigitalBook>>(new Map());
  const [dialogItem, setDialogItem] = useState<DigitalBook | null>(null);
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

    function row(book: DigitalBook) {
      const pdf = book.pdfUrl
        ? `<br><a href="${book.pdfUrl}" target="_blank" rel="noopener">PDF</a>`
        : "";
      const extra = `
        ${book.approvalStatus !== "approved" ? adminActionBtn("approve", "Approve", "primary") : ""}
        ${book.approvalStatus !== "rejected" ? adminActionBtn("reject", "Reject") : ""}
      `;
      return `<tr data-id="${book._id}">
      <td><strong>${book.coverEmoji} ${book.title}</strong><br><span class="muted">${book.author}</span></td>
      <td>${book.genre}</td>
      <td><a href="${book.url}" target="_blank" rel="noopener">Read</a>${pdf}</td>
      <td>${badge(book.approvalStatus)}<br><span class="muted">${formatDate(book.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = filter.value as "" | ApprovalStatus;
      const books = await getAdminDigitalBooks(status || undefined);
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

      if (action === "delete" && !confirm("Delete this digital title?")) return;

      try {
        if (action === "approve") await approveDigitalBook(id, "approved");
        else if (action === "reject") await approveDigitalBook(id, "rejected");
        else if (action === "delete") await deleteDigitalBook(id);
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
        <h1>Digital library</h1>
        <p>Manage virtual library titles and external reading links.</p>
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
          Add title
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
              <th>Title</th>
              <th>Genre</th>
              <th>Links</th>
              <th>Approval</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No digital books match this filter.
        </p>
      </div>

      <DigitalBookDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
