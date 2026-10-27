interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-lg border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </section>
  );
}
