import { Suspense } from "react";
import SubjectsPage from "./SubjectsContent";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center">Chargement...</div>}>
      <SubjectsPage searchParams={searchParams} />
    </Suspense>
  );
}
