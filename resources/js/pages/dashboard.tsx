import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import {
    Activity,
    CalendarDays,
    Clock3,
    PlayCircle,
    Users,
} from 'lucide-react';

import { Header } from '@/components/reusable/header';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityCards } from '@/components/dashboard/activity-cards';
import FacilitatorCard from '@/components/dashboard/facilitator-card';
import  DesignationCard  from '@/components/dashboard/designation-card';

const Dashboard = ({
    countInfo,
    recentActivities,
    deployedFacilitators,
    participantCountsByDesignation,
    cpdCount,
    nonCpdCount,
}: DashboardProps) => {

  
    const countCard: coundCardType[] = [
        {
            label: 'Total Events',
            value: countInfo.totalEvent,
            icon: CalendarDays,
            iconWrapClass:
                'bg-gradient-to-r from-blue-500 to-sky-400 text-white',
        },
        {
            label: 'Upcoming Events',
            value: countInfo.upcomingEvent,
            icon: Clock3,
            iconWrapClass:
                'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
        },
        {
            label: 'Ongoing Events',
            value: countInfo.ongoingEvent,
            icon: PlayCircle,
            iconWrapClass:
                'bg-gradient-to-r from-orange-500 to-amber-400 text-white',
        },
        {
            label: 'Total Participants',
            value: countInfo.totalParticipants,
            icon: Users,
            iconWrapClass:
                'bg-gradient-to-r from-violet-600 to-purple-400 text-white',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6 md:p-12">
                <Header
                    subHeader={false}
                    length={recentActivities.length}
                    label="Dashboard"
                    description="Get a quick overview of events, participants, and recent activity."
                    mainIcon={Activity}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {countCard.map((card) => (
                        <StatCard {...card} key={card.label} />
                    ))}
                </div>
               <DesignationCard participantCountsByDesignation={participantCountsByDesignation} cpdCount={cpdCount} nonCpdCount={nonCpdCount} />
                <FacilitatorCard events={deployedFacilitators} />

                <ActivityCards recentActivities={recentActivities} />
          
            </div>
        </AppLayout>
    );
};

export default Dashboard;