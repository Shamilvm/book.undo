"use client";

import { useEffect, useRef } from "react";
import SelectField from "@/components/SelectField";
import { syncSelectFieldFromNative } from "@/lib/select-fields";
import {
  deleteTextbookExchangeListing,
  formatDate,
  getAdminTextbookExchangeListings,
  isSuperAdmin,
  updateTextbookExchangeListingStatus,
  type AdminTextbookExchangeListing,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

function typeLabel(type: string) {
  return type === "offer" ? "Giving" : "Need";
}

function statusClass(status: string) {
  return status === "listed" ? "approved" : "";
}

export default function AdminTextbookExchangePage() {
  const statusFilterRef = useRef<HTMLSelectElement>(null);
  const typeFilterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const statusFilter = statusFilterRef.current!;
    const typeFilter = typeFilterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;
    const superAdmin = isSuperAdmin();

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      statusFilter.value = filterParam;
      syncSelectFieldFromNative(statusFilter);
    }

    function row(item: AdminTextbookExchangeListing) {
      const extra = `
        ${
          item.status === "listed"
            ? adminActionBtn("unlist", "Unlist")
            : adminActionBtn("list", "Relist", "primary")
        }
      `;
      return `<tr data-id="${item._id}">
      <td><span class="status-badge ${item.listingType === "offer" ? "approved" : "pending"}">${typeLabel(item.listingType)}</span></td>
      <td>${item.textbookDetails}${item.grade ? `<br><span class="muted">Class ${item.grade}${item.subject ? ` ${item.subject}` : ""}</span>` : ""}</td>
      <td>${item.contactName}<br><span class="muted">${item.contactPhone}</span></td>
      <td>${item.address}<br><span class="muted">${item.location}, ${item.district}</span></td>
      <td><span class="status-badge ${statusClass(item.status)}">${item.status}</span><br><span class="muted">${formatDate(item.createdAt)}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = statusFilter.value || undefined;
      const listingType = typeFilter.value || undefined;
      const items = await getAdminTextbookExchangeListings(status, listingType);
      tbody.innerHTML = items.map(row).join("");
      empty.hidden = items.length > 0;
    }

    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-action]",
      ) as HTMLElement | null;
      if (!btn) return;
      const tr = btn.closest("tr");
      if (!tr) return;
      const id = tr.getAttribute("data-id")!;
      const action = btn.getAttribute("data-action")!;

      if (action === "delete" && !confirm("Delete this listing permanently?")) {
        return;
      }

      try {
        if (action === "unlist") {
          await updateTextbookExchangeListingStatus(id, "unlisted");
        } else if (action === "list") {
          await updateTextbookExchangeListingStatus(id, "listed");
        } else if (action === "delete") {
          await deleteTextbookExchangeListing(id);
        }
        await load();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
      }
    };

    statusFilter.addEventListener("change", load);
    typeFilter.addEventListener("change", load);
    tbody.addEventListener("click", onClick);
    load();

    return () => {
      statusFilter.removeEventListener("change", load);
      typeFilter.removeEventListener("change", load);
      tbody.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div className="admin-header">
        <h1>Textbook exchange</h1>
        <p className="muted">
          Public give &amp; need listings. Unlist to hide from the site, or delete
          permanently.
        </p>
      </div>

      <div className="admin-toolbar">
        <SelectField id="status-filter" ref={statusFilterRef} defaultValue="">
          <option value="">All statuses</option>
          <option value="listed">Listed</option>
          <option value="unlisted">Unlisted</option>
        </SelectField>
        <SelectField id="type-filter" ref={typeFilterRef} defaultValue="">
          <option value="">All types</option>
          <option value="offer">Giving</option>
          <option value="need">Need</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Textbook</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Status</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} />
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No textbook exchange listings yet.
        </p>
      </div>
    </>
  );
}
