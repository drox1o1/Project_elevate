import { ComponentsSidebar } from "@/components/site/components-sidebar";

export default function ComponentsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10">
      <ComponentsSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
