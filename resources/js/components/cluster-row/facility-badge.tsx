import { X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import React from 'react';

type FacilityBadgeProps = {
    facilityList: FacilityType[] | undefined;
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        value: any,
        index?: number,
    ) => void;
    index: number;
    selectedFacilityIds: Set<number>;
    facilitiesInUsed: Set<string>;
};

const FacilityBadge = ({
    facilityList,
    handleCluster,
    index,
    selectedFacilityIds,
    facilitiesInUsed,
}: FacilityBadgeProps) => {
    return (
        <div className="flex flex-wrap gap-2">
            {(facilityList ?? [])
                .filter((facility: FacilityType) =>
                    selectedFacilityIds.has(Number(facility.id)),
                )
                .map((facility: FacilityType) => (
                    <Badge
                        title={facility.facility_name}
                        key={facility.id}
                        variant="secondary"
                        className="inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                        <span className="max-w-45 truncate">
                            {facility.facility_name}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background/80 hover:text-foreground disabled:bg-red-500"
                            disabled={facilitiesInUsed.has(
                                facility.facility_name,
                            )}
                            onClick={() =>
                                handleCluster(
                                    'facilities',
                                    Number(facility.id),
                                    index,
                                )
                            }
                        >
                            <X></X>
                        </Button>
                    </Badge>
                ))}
        </div>
    );
};

export default React.memo(FacilityBadge);
