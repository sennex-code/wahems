import { Link } from '@inertiajs/react';
import { MoreHorizontalIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type EventListCardProps = {
    item: EventListType;
    actionType: 'Attendance' | 'Events';
};

const EventCard = ({ item, actionType }: EventListCardProps) => {
    const facilityOrCluster =
        item.type === 'Cluster'
            ? item.clusters?.map((cluster) => cluster.cluster_name).join(', ')
            : item.type === 'Meeting' || item.type === 'Workshop'
              ? `Facility not available for event type: ${item.type}`
              : item.type === 'Training'
                ? item.facility
                : '';

    const href =
        actionType === 'Events' ? `event/${item.id}` : `attendance/${item.id}`;

    return (
        <Card className="mx-3 rounded-xl border">
            <CardHeader className="flex flex-row items-start gap-2 border-b px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {item.id}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-tight font-semibold">
                        {item.name}
                    </p>
                    <div className="mt-1">
                        <Badge className="text-[10px]">{item.status}</Badge>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                        >
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={href}>View</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 text-xs">
                <div>
                    <p className="text-[11px] text-muted-foreground">
                        Start Date
                    </p>
                    <p className="font-medium">
                        {new Date(item.start_at).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] text-muted-foreground">
                        End Date
                    </p>
                    <p className="font-medium">
                        {new Date(item.end_at).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                        })}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] text-muted-foreground">Type</p>
                    <p className="font-medium">{item.type}</p>
                </div>

                <div className="col-span-2">
                    <p className="text-[11px] text-muted-foreground">
                        Facility / Cluster
                    </p>
                    <p className="leading-snug font-medium break-words">
                        {facilityOrCluster || '—'}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="border-t px-4 py-3">
                <Button asChild size="sm" className="w-full">
                    <Link href={href}>View</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EventCard;
