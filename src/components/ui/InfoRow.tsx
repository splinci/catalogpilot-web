interface InfoRowProps {
    label: string;
    value?: string | number | null;
  }
  
  export default function InfoRow({
    label,
    value,
  }: InfoRowProps) {
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-b-0">
        <dt className="text-sm font-medium text-muted-foreground">
          {label}
        </dt>
  
        <dd className="col-span-2 text-sm font-medium">
          {value || "-"}
        </dd>
      </div>
    );
  }