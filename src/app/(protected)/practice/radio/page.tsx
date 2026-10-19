import RadioPractice from "@/components/drills/RadioPractice";

export default function RadioPracticePage({ searchParams }: { searchParams: { tab?: string } }) {
  return <RadioPractice initialTab={searchParams.tab} />;
}
