import { useId, useState } from 'react';

export default function InfoTooltip({ label, children }) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);

  return <span className="info-tooltip" onMouseEnter={() => setDismissed(false)}>
    <button type="button" className="info-button" aria-label={`About ${label}`} aria-describedby={id}
      onFocus={() => setDismissed(false)}
      onKeyDown={(event) => { if (event.key === 'Escape') setDismissed(true); }}>
      <span aria-hidden="true">i</span>
    </button>
    <span id={id} role="tooltip" className="info-tooltip-text" hidden={dismissed}><span>{children}</span></span>
  </span>;
}
