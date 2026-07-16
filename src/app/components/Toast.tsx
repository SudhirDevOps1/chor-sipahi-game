"use client";

import { CheckCircle2, X } from "lucide-react";

export function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={17} className="text-[var(--lime)]" />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={15} />
      </button>
    </div>
  );
}
