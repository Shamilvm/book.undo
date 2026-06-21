"use client";

import { useEffect, useRef, useState } from "react";
import SponsorshipDialog from "@/components/admin/SponsorshipDialog";
import SelectField from "@/components/SelectField";
import {
  approveSponsorship,
  deleteSponsorship,
  formatDate,
  getAdminSponsorships,
  isSuperAdmin,
  updateSponsorshipStatus,
  type AdminSponsorship,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

export default function AdminSponsorshipsPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminSponsorship>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminSponsorship | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const filter = filterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;
    const superAdmin = isSuperAdmin();

    function row(s: AdminSponsorship) {
      const pct = Math.round((s.booksFunded / s.booksNeeded) * 100);
      const approvalBadge =
        s.approvalStatus === "approved"
          ? "approved"
          : s.approvalStatus === "rejected"
            ? "rejected"
            : "pending";
      const approveBtn =
        s.approvalStatus !== "approved"
          ? adminActionBtn("approve", "Approve", "primary")
          : "";
      const rejectBtn =
        s.approvalStatus === "pending"
          ? adminActionBtn("reject", "Reject")
          : "";
      const deliverBtn =
        s.status !== "delivered" && s.approvalStatus === "approved"
          ? adminActionBtn("deliver", "Mark delivered", "primary")
          : "";
      const extra = [approveBtn, rejectBtn, deliverBtn].filter(Boolean).join("");
      return `<tr data-id="${s._id}">
      <td><strong>${s.coverEmoji} ${s.schoolName}</strong><br><span class="muted">${s.gradeRange} · ${s.contactName}</span></td>
      <td>${s.district}</td>
      <td>${s.booksFunded} / ${s.booksNeeded} books (${pct}%)</td>
      <td><span class="status-badge ${approvalBadge}">${s.approvalStatus}</span><br><span class="muted">${s.status.replace("_", " ")} · ${formatDate(s.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const approvalStatus = filter.value || undefined;
      const items = await getAdminSponsorships(undefined, approvalStatus);
      itemsRef.current = new Map(items.map((s) => [s._id, s]));
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

      if (action === "delete" && !confirm("Delete this school listing?")) return;

      try {
        if (action === "approve") await approveSponsorship(id, "approved");
        else if (action === "reject") await approveSponsorship(id, "rejected");
        else if (action === "deliver") await updateSponsorshipStatus(id, "delivered");
        else if (action === "delete") await deleteSponsorship(id);
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
        <h1>School listings</h1>
        <p>Review school submissions and approve them for the public directory.</p>
      </div>

      <div className="admin-toolbar">
        <SelectField id="filter" ref={filterRef} defaultValue="pending">
          <option value="">All</option>
          <option value="pending">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>School</th>
              <th>District</th>
              <th>Progress</th>
              <th>Status</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No school listings match this filter.
        </p>
      </div>

      <SponsorshipDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
