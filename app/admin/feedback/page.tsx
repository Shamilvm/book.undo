"use client";

import { useEffect, useRef, useState } from "react";
import FeedbackDialog from "@/components/admin/FeedbackDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  deleteFeedback,
  formatDate,
  getAdminFeedback,
  isSuperAdmin,
  updateFeedbackStatus,
  type AdminFeedback,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

const typeLabels: Record<string, string> = {
  suggestion: "Suggestion",
  query: "Query",
  bug: "Issue",
  other: "Other",
};

function statusClass(status: string) {
  if (status === "new") return "pending";
  if (status === "resolved") return "approved";
  return "";
}

export default function AdminFeedbackPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const typeFilterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminFeedback>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminFeedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const filter = filterRef.current!;
    const typeFilter = typeFilterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;
    const superAdmin = isSuperAdmin();

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      filter.value = filterParam;
      syncSelectFieldFromNative(filter);
    }

    function row(item: AdminFeedback) {
      const extra = `
        ${item.status === "new" ? adminActionBtn("read", "Mark read") : ""}
        ${item.status !== "resolved" ? adminActionBtn("resolve", "Resolve", "primary") : ""}
      `;
      return `<tr data-id="${item._id}">
      <td>${item.name}<br><span class="muted">${item.contact || "—"}</span></td>
      <td>${typeLabels[item.type] || item.type}</td>
      <td class="message-cell">${item.message}</td>
      <td><span class="status-badge ${statusClass(item.status)}">${item.status}</span><br><span class="muted">${formatDate(item.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = filter.value || undefined;
      const type = typeFilter.value || undefined;
      const items = await getAdminFeedback(status, type);
      itemsRef.current = new Map(items.map((f) => [f._id, f]));
      tbody.innerHTML = items.map(row).join("");
      empty.hidden = items.length > 0;
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
        const item = itemsRef.current.get(id);
        if (item) {
          setDialogItem(item);
          setDialogOpen(true);
        }
        return;
      }

      if (action === "delete" && !confirm("Delete this feedback?")) return;

      try {
        if (action === "read") await updateFeedbackStatus(id, "read");
        else if (action === "resolve")
          await updateFeedbackStatus(id, "resolved");
        else if (action === "delete") await deleteFeedback(id);
        await load();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
      }
    };

    tbody.addEventListener("click", onClick);
    filter.addEventListener("change", load);
    typeFilter.addEventListener("change", load);
    load();

    return () => {
      tbody.removeEventListener("click", onClick);
      filter.removeEventListener("change", load);
      typeFilter.removeEventListener("change", load);
    };
  }, [refreshKey]);

  return (
    <>
      <div className="admin-header">
        <h1>Feedback</h1>
        <p>Suggestions, questions, and issue reports from the community.</p>
      </div>

      <div className="admin-toolbar">
        <SelectField id="filter" ref={filterRef} defaultValue="">
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </SelectField>
        <SelectField id="type-filter" ref={typeFilterRef} defaultValue="">
          <option value="">All types</option>
          <option value="suggestion">Suggestions</option>
          <option value="query">Queries</option>
          <option value="bug">Issues</option>
          <option value="other">Other</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No feedback matches this filter.
        </p>
      </div>

      <FeedbackDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
