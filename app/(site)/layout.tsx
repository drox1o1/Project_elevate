import { SiteNav } from "@/components/site/site-nav";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}
