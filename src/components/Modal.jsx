import { useEffect } from "react";
import Icon from "./Icon";

// ---------------------------------------------------------------------------
// Reusable popup. Closes on Escape, on the X button, or by clicking outside.
// Usage:  <Modal title="Hello" onClose={() => ...}> content </Modal>
// ---------------------------------------------------------------------------
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={"modal" + (wide ? " wide" : "")}
        onClick={(e) => e.stopPropagation()} // clicks inside must not close it
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
