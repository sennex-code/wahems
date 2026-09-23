type EventTypeOption = (typeof EVENT_TYPE_OPTIONS)[number];
type StatusOption = (typeof STATUS_OPTIONS)[number];

type FilterType = {
    search: string;
    filterBy: 'All' | 'Training' | 'Workshop' | 'Meeting' | 'Cluster';
    statusBy: 'All' | 'Upcoming' | 'Finished' | 'Ongoing';
};
type FilterCardProps = {
    filters: FilterType;

    onReset: () => void;
    onFilterChange: (type: keyof FilterType, value: string) => void;
};

type SearchClusterType = {
    cluster_name: string;
    event_id: number;
    id: number;
};

type SearchEventItemType = {
    end_at: string;
    clusters: SearchClusterType[];
    facility: string | null;
    id: number;
    name: string;
    creator: {
        name: string;
    } | null;
    type: EventTypeSelection;
    status: 'Upcoming' | 'Ongoing' | 'Finished';
    user_id: number;
    start_at: string;
};

// GLORIOUS GENERICSSSSSSSSSSSSSSSSSSSSSSSSSSSSss
type SearchEventsListType = Paginated<SearchEventItemType>;
