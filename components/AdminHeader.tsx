"use client";

import Link from "next/link";
import {
  adminLogout,
  formatUserRole,
  type AdminSession,
} from "@/lib/admin-api";

function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export { userInitials };

type AdminHeaderProps = {
  session: AdminSession;
  compact?: boolean;
};

export default function AdminHeader({
  session,
  compact = false,
}: AdminHeaderProps) {
  const initials = userInitials(session.displayName);

  if (compact) {
    return (
      <div className="admin-user-compact">
        <span className="admin-user-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="admin-user-compact-copy">
          <span className="admin-user-name">{session.displayName}</span>
          <span className="admin-user-role">
            {formatUserRole(session.role)}
          </span>
        </span>
      </div>
    );
  }

  return (
    <header className="admin-page-header">
      <div className="admin-page-header-end">
        <div className="admin-user-card">
          <span className="admin-user-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="admin-user-meta">
            <span className="admin-user-name">{session.displayName}</span>
            <span className="admin-user-detail">
              @{session.userName}
              <span className="admin-user-sep" aria-hidden="true">
                ·
              </span>
              {formatUserRole(session.role)}
            </span>
          </div>
        </div>

        <div className="admin-page-header-actions">
          <Link href="/" className="btn btn-ghost btn-sm">
            View site
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => adminLogout()}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
