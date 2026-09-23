import { Dispatch, memo, SetStateAction } from 'react';
import { Card, CardContent } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

type AttendanceControlsType = {
    date: string;
    setDate: Dispatch<SetStateAction<string>>;
    dateRange: string[];
    viewMode: ViewModeType;
    setViewMode: Dispatch<SetStateAction<ViewModeType>>;
};

const AttendanceControls = ({
    date,
    setDate,
    dateRange,
    viewMode,
    setViewMode,
}: AttendanceControlsType) => {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-sm font-medium">
                        Attendance Controls
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Filter attendance by date and switch between participant
                        and graph view.
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Select value={date} onValueChange={setDate}>
                        <SelectTrigger className="w-full min-w-44">
                            <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {dateRange?.map((d) => (
                                    <SelectItem key={d} value={d}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select
                        value={viewMode}
                        onValueChange={(v: ViewModeType) => setViewMode(v)}
                    >
                        <SelectTrigger className="w-full min-w-44">
                            <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Participant">
                                    Participant
                                </SelectItem>
                                <SelectItem value="Graph">Graph</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};

export default memo(AttendanceControls);
