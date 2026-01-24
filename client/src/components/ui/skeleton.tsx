import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/**
 * 🃏 Resource Card Skeleton - Premium loading state
 */
function ResourceCardSkeleton() {
  return (
    <div className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
      <div className="aspect-video relative">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 left-3">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>
      <div className="p-4 md:p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * 📋 Project Card Skeleton - Premium loading state
 */
function ProjectCardSkeleton() {
  return (
    <div className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
      <div className="aspect-[4/3] relative">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-3 md:top-4 left-3 md:left-4">
          <Skeleton className="w-24 h-7 rounded-full" />
        </div>
        <div className="absolute top-3 md:top-4 right-3 md:right-4">
          <Skeleton className="w-16 h-7 rounded-full" />
        </div>
      </div>
      <div className="p-4 md:p-5 lg:p-6 space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, ResourceCardSkeleton, ProjectCardSkeleton };
