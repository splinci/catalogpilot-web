import { ReactNode } from "react";
import { PageHero } from "./PageHero";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
  badge?: string;
};

export function PageHeader({
  title,
  description,
  action,
  badge = "Splinci Commerce OS",
}: PageHeaderProps) {
  return (
    <PageHero
      title={title}
      description={description}
      actions={action}
      badge={badge}
    />
  );
}