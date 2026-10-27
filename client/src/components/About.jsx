export default function About() {
  const today = new Date();
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(today);

  return (
    <section className="about-panel">
      <p className="eyebrow">ABOUT THIS PROJECT</p>
      <h1>GitHub Copilot Demo</h1>
      <p className="muted">Current date</p>
      <time dateTime={today.toISOString()}>{date}</time>
    </section>
  );
}
