"use client";

import { useEffect, useRef, useState } from "react";
import SponsorApproveDialog from "@/components/admin/SponsorApproveDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  formatDate,
  getAdminSponsorRequests,
  updateSponsorRequestStatus,
  type AdminSponsorRequest,
} from "@/lib/admin-api";
import { adminActionBtn, adminExtraActions } from "@/lib/admin-table-actions";

function offerChip(req: AdminSponsorRequest) {
  const type = req.offerType === "books" ? "Books" : "Money";
  const detail = req.details ? ` · ${req.details}` : "";
  const variant = req.offerType === "books" ? "books" : "money";
  return `<span class="offer-chip offer-chip--${variant}">${esc(type + detail)}</span>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function AdminSponsorRequestsPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminSponsorRequest>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);
  const [approveItem, setApproveItem] = useState<AdminSponsorRequest | null>(
    null,
  );
  const [approveOpen, setApproveOpen] = useState(false);

  const openApproveRef = useRef<(req: AdminSponsorRequest) => void>(() => {});

  useEffect(() => {
    openApproveRef.current = (req: AdminSponsorRequest) => {
      setApproveItem(req);
      setApproveOpen(true);
    };
  });

  useEffect(() => {
    const filter = filterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      filter.value = filterParam;
      syncSelectFieldFromNative(filter);
    }

    function statusBadge(status: string) {
      if (status === "approved" || status === "resolved") return "approved";
      if (status === "rejected") return "rejected";
      return "pending";
    }

    function row(req: AdminSponsorRequest) {
      const approveBtn =
        req.status === "contacted"
          ? adminActionBtn("approve", "Approve", "primary")
          : "";
      const contactBtn =
        req.status === "pending"
          ? adminActionBtn("contact", "Mark contacted")
          : "";
      const resolveBtn =
        req.status === "approved"
          ? adminActionBtn("resolve", "Mark resolved")
          : "";
      const rejectBtn =
        req.status === "pending" || req.status === "contacted"
          ? adminActionBtn("reject", "Reject")
          : "";
      const actions = [approveBtn, contactBtn, resolveBtn, rejectBtn]
        .filter(Boolean)
        .join("");

      const message = req.message
        ? `<span class="sponsor-message-text">${esc(req.message)}</span>`
        : `<span class="muted">—</span>`;

      return `<tr data-id="${req._id}">
      <td><strong>${esc(req.schoolName)}</strong></td>
      <td>${esc(req.sponsorName)}<br><span class="muted">${esc(req.sponsorContact)}</span></td>
      <td>${offerChip(req)}</td>
      <td>${message}</td>
      <td><span class="status-badge ${statusBadge(req.status)}">${req.status}</span><br><span class="muted">${formatDate(req.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminExtraActions(actions)}</td>
    </tr>`;
    }

    async function load() {
      const status = filter.value || undefined;
      const requests = await getAdminSponsorRequests(status);
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
      const req = itemsRef.current.get(id);
      if (!req) return;

      try {
        if (action === "approve") {
          openApproveRef.current(req);
          return;
        }
        if (action === "contact") {
          await updateSponsorRequestStatus(id, { status: "contacted" });
        } else if (action === "resolve") {
          await updateSponsorRequestStatus(id, { status: "resolved" });
        } else if (action === "reject") {
          if (!confirm("Reject this sponsor request?")) return;
          await updateSponsorRequestStatus(id, { status: "rejected" });
        }
        await load();
        setRefreshKey((k) => k + 1);
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
        <h1>Sponsor requests</h1>
        <p>
          Mark pending requests as contacted, then approve with book count and
          optional money. Approving updates the school&apos;s public progress
          bar.
        </p>
      </div>

      <div className="admin-toolbar">
        <SelectField id="filter" ref={filterRef} defaultValue="pending">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="approved">Approved</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table--sponsor-requests">
          <thead>
            <tr>
              <th>School</th>
              <th>Sponsor</th>
              <th>Offer</th>
              <th>Message</th>
              <th>Status</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No sponsor requests match this filter.
        </p>
      </div>

      <SponsorApproveDialog
        item={approveItem}
        open={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          setApproveItem(null);
        }}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
