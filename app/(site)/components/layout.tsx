import { ComponentsSidebar } from "@/components/site/components-sidebar";

export default function ComponentsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 pt-4 md:flex-row md:pt-10 lg:px-6">
      <ComponentsSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
