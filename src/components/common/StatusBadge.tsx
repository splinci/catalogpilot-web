import { ProductStatus } from "@/generated/prisma/enums";

type Status =
  | ProductStatus
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "DRAFT";

type Props = {
  status: Status;
};

const variants: Record<Status, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",

  PENDING: "bg-yellow-100 text-yellow-700",

  COMPLETED: "bg-blue-100 text-blue-700",

  FAILED: "bg-red-100 text-red-700",

  DRAFT: "bg-slate-100 text-slate-700",
};

export function StatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${variants[status]}
      `}
    >
      {status}
    </span>
  );
}