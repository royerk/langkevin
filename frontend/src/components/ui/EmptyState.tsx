interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-gray-500 mb-3">{icon}</div>}
      <h3 className="text-gray-400 font-medium">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
