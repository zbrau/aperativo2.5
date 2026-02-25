import React from 'react';

interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded-lg ${className}`} />
);

export const FoodItemSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
        <Skeleton className="h-32 sm:h-40 w-full rounded-none" />
        <div className="p-3 flex flex-col flex-1 justify-between">
            <div className="mb-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    </div>
);

export const OrderSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-4 w-16" />
    </div>
);

export default Skeleton;
