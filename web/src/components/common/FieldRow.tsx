import { ReactNode } from 'react';

interface FieldRowProps {
  label: string;
  value?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  valueClassName?: string;
}

export function FieldRow({ label, value, icon, action, children, valueClassName }: FieldRowProps) {
  if (children) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      {value && (
        <div className="flex items-start gap-2">
          {icon}
          <p className={`text-gray-900 ${valueClassName ?? ''}`}>{value}</p>
        </div>
      )}
      {action}
    </div>
  );
}
