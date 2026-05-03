interface ButtonContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonContainer({ children, className = '' }: ButtonContainerProps) {
  return (
    <div className={`flex gap-2 button-container ${className}`}>
      {children}
    </div>
  );
}
