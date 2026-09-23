import { CalendarDays } from 'lucide-react';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { memo } from 'react';

type AttendanceHeaderType = {
    eventName: string;
    selectedDate: string;
    eventType: string;
};

const AttendanceHeader = ({
    eventName,
    selectedDate,
    eventType,
}: AttendanceHeaderType) => {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <Label className="text-2xl font-semibold">{eventName}</Label>
                <div className="text-sm text-muted-foreground">
                    Monitor participant attendance, scan access QR, and review
                    attendance records by date.
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {selectedDate}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                    {eventType}
                </Badge>
            </div>
        </div>
    );
};

export default memo(AttendanceHeader);
