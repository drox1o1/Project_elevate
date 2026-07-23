import { redirect } from "next/navigation";

// DUKU Labs is now MIT-licensed and free — there is no pricing. Keep this
// route as a permanent redirect so existing links resolve to the new
// open-source page.
export default function PricingPage() {
  redirect("/open-source");
}
