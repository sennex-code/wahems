import { Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Header } from '../reusable/header';

type DeployedFacilitatorEvent = {
    event_name: string;
    event_address: string;
    facilitators: string[];
};

type FacilitatorCardProps = {
    events: DeployedFacilitatorEvent[];
};
const FacilitatorCard = ({ events }: FacilitatorCardProps) => {

    console.log("events to the component:",events)
    return (
        <Card className="w-full">
            <Header
                subHeaderIcon={Users}
                subHeader={true}
                length={events.length}
                label="Whos is on the field?"
                description="View all ongoing events and the facilitators assigned to them."
            />

            <CardContent className="p-4 md:p-5">
                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event, index) => (
                            <div
                                key={`${event.event_name}-${index}`}
                                className="rounded-xl border bg-background p-4 transition hover:bg-accent/30"
                            >
                                <div className="mb-3">
                                    <p className="text-lg font-bold text-foreground">
                                        Event: {event.event_name}
                                    </p>
                                    <p className='ml-3'>Address: {event.event_address}</p>
                                </div>

                                {event.facilitators && event.facilitators.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {event.facilitators.map((facilitator, facilitatorIndex) => (
                                            <span
                                                key={`${facilitator}-${facilitatorIndex}`}
                                                className="rounded-full bg-primary/10 px-3 py-1 text-md font-medium text-primary"
                                            >
                                                {facilitator}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No facilitators assigned.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm font-medium text-foreground">
                            No ongoing events yet
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Assigned facilitators will appear here once events are ongoing.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FacilitatorCard;