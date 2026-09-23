import { defaultFilters } from '@/constants/constant';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type UseFilterType = {
    filters: FilterType;
    endPoint: string;
};

export const useFilter = ({ filters, endPoint }: UseFilterType) => {
    const [localFilters, setLocalFilters] = useState<FilterType>({
        search: filters.search || defaultFilters.search,
        filterBy: filters.filterBy || defaultFilters.filterBy,
        statusBy: filters.statusBy || defaultFilters.statusBy,
    });

    const onFilterChange = <K extends keyof FilterType>(
        key: K,
        value: FilterType[K],
    ) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const onReset = () => {
        // Creates a fresh object for reset
        setLocalFilters({ ...defaultFilters });
    };
    useEffect(() => {
        if (
            (filters.search ?? '') === localFilters.search &&
            (filters.filterBy ?? 'All') === localFilters.filterBy &&
            (filters.statusBy ?? 'All') === localFilters.statusBy
        ) {
            return;
        }
        const timer = setTimeout(() => {
            router.get(route(endPoint), localFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [localFilters, filters, endPoint]);
    return {
        onReset,
        localFilters,
        setLocalFilters,
        onFilterChange,
    };
};
