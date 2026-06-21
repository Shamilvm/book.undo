"use client";

import { useEffect, useRef, useState } from "react";
import UserDialog from "@/components/admin/UserDialog";
import SelectField from "@/components/SelectField";
import {
  deleteAdminUser,
  formatDate,
  formatUserRole,
  getAdminUsers,
  isSuperAdmin,
  updateAdminUser,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/admin-api";
import { adminActionBtn, adminRowActions } from "@/lib/admin-table-actions";

function statusClass(status: string) {
  return status === "active" ? "approved" : "rejected";
}

export default function AdminUsersPage() {
  const filterRef = useRef<HTMLSelectElement>(null);
  const roleFilterRef = useRef<HTMLSelectElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<Map<string, AdminUser>>(new Map());
  const [dialogItem, setDialogItem] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const filter = filterRef.current!;
    const roleFilter = roleFilterRef.current!;
    const tbody = tbodyRef.current!;
    const empty = emptyRef.current!;
    const superAdmin = isSuperAdmin();

    function row(item: AdminUser) {
      const extra =
        item.status === "active"
          ? adminActionBtn("deactivate", "Deactivate")
          : adminActionBtn("activate", "Activate", "primary");
      return `<tr data-id="${item._id}">
      <td><strong>${item.displayName}</strong><br><span class="muted">@${item.userName}</span></td>
      <td>${item.buId || "—"}</td>
      <td>${formatUserRole(item.role)}</td>
      <td><span class="status-badge ${item.hasPassword ? "approved" : "pending"}">${item.hasPassword ? "Set" : "Not set"}</span></td>
      <td><span class="status-badge ${statusClass(item.status)}">${item.status}</span></td>
      <td>${item.email}<br><span class="muted">${item.phone || "—"}</span></td>
      <td class="admin-actions-cell">${adminRowActions(extra, superAdmin)}</td>
    </tr>`;
    }

    async function load() {
      const status = (filter.value || undefined) as UserStatus | undefined;
      const role = (roleFilter.value || undefined) as UserRole | undefined;
      const items = await getAdminUsers({ status, role });
      itemsRef.current = new Map(items.map((u) => [u._id, u]));
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
        const user = itemsRef.current.get(id);
        if (user) {
          setDialogItem(user);
          setDialogOpen(true);
        }
        return;
      }

      if (action === "delete" && !confirm("Delete this user?")) return;

      try {
        if (action === "activate") {
          await updateAdminUser(id, { status: "active" });
        } else if (action === "deactivate") {
          await updateAdminUser(id, { status: "inactive" });
        } else if (action === "delete") await deleteAdminUser(id);
        await load();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
      }
    };

    tbody.addEventListener("click", onClick);
    filter.addEventListener("change", load);
    roleFilter.addEventListener("change", load);
    load();

    return () => {
      tbody.removeEventListener("click", onClick);
      filter.removeEventListener("change", load);
      roleFilter.removeEventListener("change", load);
    };
  }, [refreshKey]);

  return (
    <>
      <div className="admin-header">
        <h1>Users</h1>
        <p>Manage platform accounts, roles, and access status.</p>
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
          Add user
        </button>
        <SelectField id="filter" ref={filterRef} defaultValue="">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
        <SelectField id="role-filter" ref={roleFilterRef} defaultValue="">
          <option value="">All roles</option>
          <option value="default">Default</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </SelectField>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>BU ID</th>
              <th>Role</th>
              <th>Password</th>
              <th>Status</th>
              <th>Contact</th>
              <th className="admin-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody id="tbody" ref={tbodyRef}></tbody>
        </table>
        <p className="admin-empty" id="empty" hidden ref={emptyRef}>
          No users match this filter.
        </p>
      </div>

      <UserDialog
        item={dialogItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
