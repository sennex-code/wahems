import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { CreateEvents } from '@/components/event/create-events';
import { ListTable } from '@/components/event/list-table';
import { TablePagination } from '@/components/reusable/table-pagination';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import useEventHandler from '@/hooks/eventHandler';
import { usePSGC } from '@/hooks/queries/usePSGC';

import {
    CalculatorIcon,
    CalendarDays,
    Plus,
    SlidersHorizontal,
} from 'lucide-react';

import { useFilter } from '@/hooks/utils/useFilter.utils';
import { FilterCard } from '@/components/reusable/filter-card';

import { Header } from '@/components/reusable/header';

type EventsProps = {
    eventsList: SearchEventsListType;
    filters: FilterType;
};

type Facilitator = {
    id: number;
    name: string;
};

export default function Events({ eventsList, filters }: EventsProps) {
    const {
        event,
        onChangeInput,
        handleCluster,
        onSubmit,
        pageOneMissing,
        pageThreeMissing,
        pageTwoMissing,
        clusterMissing,
    } = useEventHandler();

   // Empty dependency array = runs once on mount

    const { regions, provinces, municipalities, facilities } = usePSGC({
        region: event.data.region,
        province: event.data.province,
        municipality: event.data.municipality,
    });

    const { onReset, localFilters, onFilterChange } = useFilter({
        filters: filters,
        endPoint: 'event.index',
    });

    const [isCreateModalShown, toggleCreateModal] = useState<boolean>(false);

    return (
        <AppLayout>
            <Head title="Events" />

            <div className="flex flex-col gap-6 p-6 md:p-12">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <Header
                        mainIcon={CalendarDays}
                        label="Events"
                        description=" Manage events, review schedules, and track their
                            current status."
                        subHeader={false}
                    ></Header>
                    <Button
                        onClick={() => toggleCreateModal(true)}
                        size="lg"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Event
                    </Button>
                </div>

                <CreateEvents
                    eventAction="Creating"
                    isCreateModalShown={isCreateModalShown}
                    toggleCreateModal={toggleCreateModal}
                    onSubmit={onSubmit}
                    event={event.data}
                    
                    eventProcessing={event.processing}
                    onChangeInput={onChangeInput}
                    regions={regions.data}
                    provinces={provinces.data}
                    municipalities={municipalities.data}
                    facilities={facilities.data ?? []}
                    handleCluster={handleCluster}
                    clusters={event.data.clusters}
                    pageOneMissing={pageOneMissing}
                    pageTwoMissing={pageTwoMissing}
                    pageThreeMissing={pageThreeMissing}
                    clusterMissing={clusterMissing}
                />

                <Card className="w-full">
                    <Header
                        label=" Filters"
                        description="Search and narrow down the event list."
                        subHeader={true}
                        subHeaderIcon={SlidersHorizontal}
                        length={eventsList?.data?.length ?? 0}
                    ></Header>
                    <FilterCard
                        filters={localFilters}
                        onReset={onReset}
                        onFilterChange={onFilterChange}
                    ></FilterCard>
                </Card>

                <Card className="w-full overflow-hidden">
                    <Header
                        label=" Event List"
                        description="Review and manage existing events."
                        subHeader={true}
                        subHeaderIcon={CalculatorIcon}
                    ></Header>
                    <CardContent className="p-0">
                        <div className="max-h-[70vh] overflow-auto px-5">
                            <ListTable
                                actionType="Events"
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