interface DescriptionProps {
  children: React.ReactNode;
}

export function Description({ children }: DescriptionProps) {
  return (
    <p className="text-gray-600 hidden md:block">
      {children}
    </p>
  );
}