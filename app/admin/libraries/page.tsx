"use client";

import { useEffect, useRef, useState } from "react";
import LibraryDialog from "@/components/admin/LibraryDialog";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  approveLibrary,
  deleteLibrary,
  formatApprovalStatus,
  formatDate,
  getAdminLibraries,
  isSuperAdmin,
  type AdminLibrary,
  type ApprovalStatus,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

function formatSource(source?: string) {
  const map: Record<string, string> = {
    registered: "Registration",
    reported: "Map report",
    admin: "Admin",
  };
  return map[source || "registered"] || source || "—";
}

export default function AdminLibrariesPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminLibrary>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminLibrary | null>(null);
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

    function row(lib: AdminLibrary) {
      const extra = `
        ${lib.approvalStatus !== "approved" ? adminActionBtn("approve", "Approve", "primary") : ""}
        ${lib.approvalStatus !== "rejected" ? adminActionBtn("reject", "Reject") : ""}
      `;
      const coords =
        lib.latitude != null && lib.longitude != null
          ? `<br><span class="muted">${lib.latitude.toFixed(4)}, ${lib.longitude.toFixed(4)}</span>`
          : `<br><span class="muted">No coordinates</span>`;
      return `<tr data-id="${lib._id}">
      <td><strong>${lib.coverEmoji} ${lib.name}</strong><br><span class="muted">${lib.libraryType} · ${formatSource(lib.source)}</span></td>
      <td>${lib.curatorName}${lib.curatorContact ? `<br><span class="muted">${lib.curatorContact}</span>` : ""}</td>
      <td>${lib.location}, ${lib.district}${lib.state ? `, ${lib.state}` : ""}${coords}</td>
      <td>${lib.bookCount}</td>
      <td>${badge(lib.approvalStatus)}<br><span class="muted">${formatDate(lib.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const value = filter.value;
      let libraries: AdminLibrary[];
      if (value === "reported") {
        libraries = await getAdminLibraries("pending", "reported");
      } else {
        libraries = await getAdminLibraries(
          (value as "" | ApprovalStatus) || undefined,
        );
      }
      itemsRef.current = new Map(libraries.map((l) => [l._id, l]));
      tbody.innerHTML = libraries.map(row).join("");
      empty.hidden = libraries.length > 0;
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
        const lib = itemsRef.current.get(id);
        if (lib) {
          setDialogItem(lib);
          setDialogOpen(true);
        }
        return;
      }

      if (
        action === "delete" &&
        !confirm("Delete this library and all its books?")
      )
        return;

      try {
        if (action === "approve") await approveLibrary(id, "approved");
        else if (action === "reject") await approveLibrary(id, "rejected");
        else if (action === "delete") await deleteLibrary(id);
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
        <h1>Libraries</h1>
        <p>
          Approve library registrations, map reports, or remove libraries.
        </p>
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
          Add library
        </button>
        <SelectField id="filter" ref={filterRef} defaultValue="">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="reported">Reported (pending)</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Library</th>
              <th>Curator</th>
              <th>Location</th>
              <th>Books</th>
              <th>Approval</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No libraries match this filter.
        </p>
      </div>

      <LibraryDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
