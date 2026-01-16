interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <p className="text-red-400 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-red-300 hover:text-red-200 text-sm underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
