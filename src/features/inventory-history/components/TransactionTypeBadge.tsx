type Props = {
    type: string;
  };
  
  const styles: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    PURCHASE: {
      label: "Purchase",
      className:
        "bg-blue-100 text-blue-700",
    },
    SALE: {
      label: "Sale",
      className:
        "bg-red-100 text-red-700",
    },
    RETURN: {
      label: "Return",
      className:
        "bg-purple-100 text-purple-700",
    },
    TRANSFER: {
      label: "Transfer",
      className:
        "bg-orange-100 text-orange-700",
    },
    DAMAGE: {
      label: "Damage",
      className:
        "bg-red-100 text-red-700",
    },
    ADJUSTMENT_IN: {
      label: "Adjustment In",
      className:
        "bg-green-100 text-green-700",
    },
    ADJUSTMENT_OUT: {
      label: "Adjustment Out",
      className:
        "bg-yellow-100 text-yellow-700",
    },
  };
  
  export default function TransactionTypeBadge({
    type,
  }: Props) {
    const badge =
      styles[type] ?? {
        label: type,
        className:
          "bg-slate-100 text-slate-700",
      };
  
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  }