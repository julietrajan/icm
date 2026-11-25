export default function About({ now }) {
  const date = new Date(now);
  const dateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return <>
    <div className="page-heading"><div><p className="eyebrow">ABOUT</p><h1>GitHub Copilot Demo</h1></div></div>
    <section className="stat-card" aria-labelledby="current-date-heading">
      <h2 id="current-date-heading">Current date</h2>
      <p><time dateTime={dateTime}>{date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</time></p>
    </section>
  </>;
}
