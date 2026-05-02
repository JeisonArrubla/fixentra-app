import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-2xl font-light text-gray-900">{title}</h1>
        {badge}
      </div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {actions && <div className="mt-4 flex justify-center gap-2">{actions}</div>}
    </div>
  );
}
