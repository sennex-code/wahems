import { ActivityIcon, Clock3 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Header } from '../reusable/header';

type ActivityCardsType = {
    recentActivities: RecentActivitiesType[];
};
export const ActivityCards = ({ recentActivities }: ActivityCardsType) => {
    return (
        <Card className="w-full">
            <Header
                subHeaderIcon={ActivityIcon}
                subHeader={true}
                length={recentActivities.length}
                label="Recent Activities"
                description="   Track recently created, updated, and
                                    registered activity in the system."
            ></Header>

            <CardContent className="p-4 md:p-5">
                {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex flex-col gap-3 rounded-xl border bg-background p-4 transition hover:bg-accent/30 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.created_at}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock3 className="h-4 w-4" />
                                    <span>{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm font-medium text-foreground">
                            No recent activities yet
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            New event actions and participant activity will
                            appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
