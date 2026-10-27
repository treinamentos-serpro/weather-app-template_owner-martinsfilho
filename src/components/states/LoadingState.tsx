interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando previsão...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      className="flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-6 text-white/80 shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-accent-400 motion-reduce:animate-none"
      />
      <span>{message}</span>
    </div>
  );
}
