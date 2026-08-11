import React from "react";

const STATUS_COLORS = {
  "not-started": "bg-base-600 text-base-50/70",
  "running": "bg-signal-amber/15 text-signal-amber",
  "in-progress": "bg-signal-amber/15 text-signal-amber",
  "completed": "bg-signal-green/15 text-signal-green",
  "on-hold": "bg-signal-rose/15 text-signal-rose",
  "backlog": "bg-base-600 text-base-50/70",
  "exploring": "bg-signal-violet/15 text-signal-violet",
  "parked": "bg-base-600 text-base-50/60",
  "converted": "bg-signal-green/15 text-signal-green",
  "pending": "bg-base-600 text-base-50/70",
  "missed": "bg-signal-rose/15 text-signal-rose",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_COLORS[status] || "bg-base-600"}`}>
    <span className="status-dot bg-current" />
    {status}
  </span>
);

export default StatusBadge;
