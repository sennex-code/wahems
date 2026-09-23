import React, { Dispatch, RefObject, SetStateAction } from 'react';
import ClusterFacilityListDropdown from './cluster-facility-list-dropdown';
import FacilityBadge from './facility-badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Info } from 'lucide-react';
type ClusterFacilityWrapperProps = {
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        value: any,
        index?: number,
    ) => void;
    index: number;
    selectedFacilityIds: Set<number>;
    facilitiesInUsed: Set<string>;

    isShown: boolean;
    dropdownRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    facilitiesWrapperRef: RefObject<HTMLDivElement | null>;
    selectedCount: number;
    facilityList: FacilityType[];
    setShown: Dispatch<SetStateAction<boolean>>;
};

const ClusterFacilityWrapper = ({
    isShown,
    dropdownRef,
    selectedCount,
    facilityList,
    setShown,
    selectedFacilityIds,
    facilitiesInUsed,
    handleCluster,
    triggerRef,
    index,

    facilitiesWrapperRef,
}: ClusterFacilityWrapperProps) => {
    return (
        <div
            ref={facilitiesWrapperRef}
            className="relative col-span-1 space-y-3 md:col-span-2"
        >
            <div className="flex items-center justify-between">
                <Label>Facilities</Label>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="text-muted-foreground transition hover:text-foreground"
                        >
                            <Info size={16} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs text-center text-xs">
                            Facilities with registered participants are
                            automatically disabled.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <FacilityBadge
                facilityList={facilityList}
                handleCluster={handleCluster}
                index={index}
                selectedFacilityIds={selectedFacilityIds}
                facilitiesInUsed={facilitiesInUsed}
            ></FacilityBadge>

            <ClusterFacilityListDropdown
                triggerRef={triggerRef}
                isShown={isShown}
                dropdownRef={dropdownRef}
                selectedCount={selectedCount}
                facilityList={facilityList}
                setShown={setShown}
                selectedFacilityIds={selectedFacilityIds}
                facilitiesInUsed={facilitiesInUsed}
                handleCluster={handleCluster}
                index={index}
            ></ClusterFacilityListDropdown>
        </div>
    );
};

export default React.memo(ClusterFacilityWrapper);
