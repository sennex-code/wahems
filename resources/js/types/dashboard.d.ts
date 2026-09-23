type coundCardType = {
    label: string;
    value: number;
    icon: ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
    iconWrapClass: string;
};

type RecentActivitiesType = {
    id: string;
    type: 'register' | 'update' | 'create';
    message: string;
    created_at: string;
    time: string;
};

type CountsPerDesignationRow = {
  designation: string;
  total_count: number | string;
  cpd_count: number | string;
  non_cpd_count: number | string;
};

type DashboardProps = {
    countInfo: {
        totalEvent: number;
        upcomingEvent: number;
        ongoingEvent: number;
        totalParticipants: number;
    };
    recentActivities: RecentActivitiesType[];
    deployedFacilitators: {
        event_name: string;
        event_address: string;
        facilitators: string[];
    }[];
    participantCountsByDesignation: CountsPerDesignationRow[];
    cpdCount: number;
    nonCpdCount: number;
};
