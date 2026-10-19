import RadioPractice from "@/components/drills/RadioPractice";

export default async function RadioPracticePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <RadioPractice initialTab={tab} />;
}
