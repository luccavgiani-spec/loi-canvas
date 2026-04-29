import { Package } from 'lucide-react';

interface EmptyStateProps {
  label: string;
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package size={40} className="text-muted-foreground/40 mb-4" />
      <p className="text-base text-muted-foreground">Nenhum(a) {label} encontrado(a).</p>
    </div>
  );
}
