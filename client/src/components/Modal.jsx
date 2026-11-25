import { useEffect, useRef } from 'react';

export default function Modal({ title, subtitle, onClose, busy, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={ref} className="modal" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className="modal-header"><div><p className="eyebrow">{subtitle}</p><h2 id="dialog-title">{title}</h2></div>
      <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={busy}>X</button></header>
    {children}
  </dialog>;
}
