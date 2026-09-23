import { Link } from '@inertiajs/react';
import { MoreHorizontalIcon, CalendarRange, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import useEventHandler from '@/hooks/eventHandler';
import { DeleteConfirmation } from '../reusable/delete-modal';
import { Empty, EmptyDescription, EmptyHeader } from '../ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../../lottie/NoResult.json';

interface ListTableProps {
    eventsList: SearchEventItemType[];
    actionType: 'Attendance' | 'Events';
}

const statusVariant = (status: string | undefined) => {
    switch (status) {
        case 'Upcoming':
            return 'secondary';
        case 'Ongoing':
            return 'default';
        case 'Finished':
            return 'outline';
        default:
            return 'secondary';
    }
};

export function ListTable({ eventsList, actionType }: ListTableProps) {
    const {
        handleDelete,
        isDeleteShown,
        toggleDeleteModal,
        eventId,
        setEventId,
    } = useEventHandler();

    return (
        <>
            {eventsList.length > 0 ? (
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Facility/Cluster</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {eventsList.map((item) => (
                            <TableRow
                                key={item.id}
                                className="transition-colors hover:bg-accent/40"
                            >
                                <TableCell className="font-medium">
                                    {item.id}
                                </TableCell>

                                <TableCell>
                                    <div className="min-w-0">
                                        <div
                                            className="max-w-55 truncate font-medium"
                                            title={item.name}
                                        >
                                            {item.name}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.creator?.name}
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CalendarRange className="h-4 w-4 text-muted-foreground" />
                                        {new Date(
                                            item.start_at,
                                        ).toLocaleDateString('en-US', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(item.end_at).toLocaleDateString(
                                        'en-US',
                                        {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                        },
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">{item.type}</Badge>
                                </TableCell>

                                <TableCell>
                                    <div
                                        className="max-w-60 truncate text-sm text-muted-foreground"
                                        title={
                                            item.facility ? item.facility : ''
                                        }
                                    >
                                        {item.type === 'Cluster' ? (
                                            <div className="space-y-1">
                                                {item.clusters?.map(
                                                    (cluster, index) => (
                                                        <p key={index}>
                                                            {
                                                                cluster.cluster_name
                                                            }
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        ) : item.type === 'Meeting' ||
                                          item.type === 'Workshop' ? (
                                            `Facility not available for event type: ${item.type}`
                                        ) : item.type === 'Training' ? (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span>{item.facility}</span>
                                            </div>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant={
                                            statusVariant(item.status) as
                                                | 'default'
                                                | 'secondary'
                                                | 'outline'
                                                | 'destructive'
                                        }
                                    >
                                        {item.status}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                            >
                                                <MoreHorizontalIcon className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Open menu
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={
                                                        actionType === 'Events'
                                                            ? `events/${item.id}`
                                                            : `attendance/${item.id}`
                                                    }
                                                >
                                                    View
                                                </Link>
                                            </DropdownMenuItem>

                                            {actionType === 'Events' && (
                                                <DropdownMenuItem asChild>
                                                    <Button
                                                        variant={'destructive'}
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            toggleDeleteModal(
                                                                true,
                                                            );
                                                            setEventId(item.id);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Empty className="py-12">
                    <Lottie
                        loop
                        className="h-auto w-40"
                        animationData={errorAnimation}
                    />
                    <EmptyHeader>
                        <EmptyDescription>
                            No results have been found.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {isDeleteShown && (
                <DeleteConfirmation
                    isDeleteShown={isDeleteShown}
                    toggleDeleteModal={() => toggleDeleteModal((prev) => !prev)}
                    onAction={() => handleDelete(Number(eventId))}
                />
            )}
        </>
    );
}
