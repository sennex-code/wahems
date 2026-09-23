import { Search } from 'lucide-react';
import { CardContent } from '../ui/card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '../ui/input-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

import { Button } from '../ui/button';
import { EVENT_TYPE_OPTIONS, STATUS_OPTIONS } from '@/constants/constant';

export const FilterCard = ({
    filters,
    onReset,
    onFilterChange,
}: FilterCardProps) => {
    return (
        <CardContent className="p-4 md:p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
                <InputGroup>
                    <InputGroupInput
                        name="search_event"
                        className="px-3 py-2"
                        value={filters.search}
                        onChange={(e) =>
                            onFilterChange('search', e.target.value)
                        }
                        placeholder="Search event name..."
                    />
                    <InputGroupAddon>
                        <Search className="h-4 w-4" />
                    </InputGroupAddon>
                </InputGroup>

                <Select
                    value={filters.filterBy}
                    onValueChange={(e) => onFilterChange('filterBy', e)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {EVENT_TYPE_OPTIONS.map((eventType, index) => (
                                <SelectItem key={index} value={eventType}>
                                    {eventType}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.statusBy}
                    onValueChange={(e) => onFilterChange('statusBy', e)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {STATUS_OPTIONS.map((value, index) => (
                                <SelectItem value={value} key={index}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Button
                    type="button"
                    onClick={onReset}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium"
                >
                    Reset
                </Button>
            </div>
        </CardContent>
    );
};
