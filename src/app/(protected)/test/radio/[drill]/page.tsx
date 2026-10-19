import { notFound } from "next/navigation";
import RadioPractice from "@/components/drills/RadioPractice";
import { RADIO_DRILLS } from "@/content/radio";

export function generateStaticParams() {
  return RADIO_DRILLS.map((drill) => ({ drill }));
}

export default async function RadioDrillPage({ params }: { params: Promise<{ drill: string }> }) {
  const { drill } = await params;
  if (!(RADIO_DRILLS as readonly string[]).includes(drill)) notFound();
  return <RadioPractice initialTab={drill} />;
}
