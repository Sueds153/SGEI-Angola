import { Skeleton, Container } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="grid lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-3xl w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-16 w-1/2 mt-4" />
          <Skeleton className="h-12 w-full mt-6 rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
