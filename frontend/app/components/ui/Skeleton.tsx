'use client';
import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-6', className)}>
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 items-center py-3 px-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/8" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
