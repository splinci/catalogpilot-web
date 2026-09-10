interface BadgeProps {
    children: React.ReactNode;
    variant?:
      | "default"
      | "success"
      | "warning"
      | "danger"
      | "info";
  }
  
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  
  export default function Badge({
    children,
    variant = "default",
  }: BadgeProps) {
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
      >
        {children}
      </span>
    );
  }