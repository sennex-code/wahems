import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { ListTable } from '@/components/event/list-table';
import { TablePagination } from '@/components/reusable/table-pagination';
import { Card, CardContent } from '@/components/ui/card';

import {
    Calendar,
    CalendarCheck2,
    Search,
    SlidersHorizontal,
} from 'lucide-react';

import { Header } from '@/components/reusable/header';

import { FilterCard } from '@/components/reusable/filter-card';
import { useFilter } from '@/hooks/utils/useFilter.utils';

type AttendanceProps = {
    eventsList: SearchEventsListType;
    filters: FilterType;
};

export default function Attendance({ eventsList, filters }: AttendanceProps) {
    // Filter logic
    const { onReset, localFilters, onFilterChange } = useFilter({
        filters: filters,
        endPoint: 'attendance.index',
    });
    return (
        <AppLayout>
            <Head title="Attendance" />

            <div className="flex flex-col gap-6 p-6 md:p-12">
                <Header
                    label=" Attendance"
                    description="Review attendance-eligible events and filter them by
                            type or status."
                    subHeader={false}
                    mainIcon={CalendarCheck2}
                ></Header>
                <Card className="w-full">
                    <Header
                        label=" Filters"
                        description=" Search and narrow down the attendance event
                                    list."
                        subHeader={true}
                        subHeaderIcon={SlidersHorizontal}
                        length={eventsList?.data?.length ?? 0}
                    ></Header>

                    {/* Filter search component */}
                    <FilterCard
                        filters={localFilters}
                        onReset={onReset}
                        onFilterChange={onFilterChange}
                    ></FilterCard>
                </Card>

                <Card className="w-full overflow-hidden">
                    <Header
                        label="  Attendance Events"
                        description=" Review available events for attendance
                                management."
                        subHeader={true}
                        subHeaderIcon={Calendar}
                        length={eventsList.data.length ?? 0}
                    ></Header>

                    <CardContent className="p-0">
                        <div className="max-h-[70vh] overflow-auto px-5">
                            <ListTable
                                actionType="Attendance"
                                eventsList={eventsList.data ?? []}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-2">
                    <TablePagination links={eventsList.links} />
                </div>
            </div>
        </AppLayout>
    );
}
