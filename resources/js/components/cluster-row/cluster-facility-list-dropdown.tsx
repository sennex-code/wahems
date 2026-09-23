import { AnimatePresence, motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import React, {
    Dispatch,
    RefObject,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react';
import FacilityOptionRow from './facility-option-row';
import { Input } from '../ui/input';
import { useDebounce } from '@/hooks/useDebounce';

type ClusterFacilityListDropdownProps = {
    isShown: boolean;
    dropdownRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    selectedCount: number;
    facilityList: FacilityType[];
    setShown: Dispatch<SetStateAction<boolean>>;
    selectedFacilityIds: Set<number>;
    facilitiesInUsed: Set<string>;

    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        value: any,
        index?: number,
    ) => void;

    index: number;
};

const ClusterFacilityListDropdown = ({
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
}: ClusterFacilityListDropdownProps) => {
    const [search, setSearch] = useState<string>('');

    // Debounced the search
    const debounced = useDebounce(search, 1000);

    const filteredFacility = useMemo(() => {
        const query = debounced?.trim().toLowerCase();

        if (!query) return facilityList;

        // Query the current facility list
        return facilityList.filter((facility) =>
            facility.facility_name.toLowerCase().includes(query),
        );
    }, [facilityList, debounced]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setShown((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3.5 text-left transition hover:bg-accent/30"
            >
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {selectedCount
                            ? `${selectedCount} selected`
                            : 'Select facilities'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Choose one or more facilities for this cluster
                    </span>
                </div>

                <span className="text-xs text-muted-foreground">
                    {isShown ? 'Close' : 'Open'}
                </span>
            </button>

            <AnimatePresence>
                {isShown && (
                    <motion.div
                        ref={dropdownRef}
                        key="facilities-dropdown"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-50 mt-2 w-full"
                    >
                        <Card className="overflow-hidden rounded-xl border shadow-lg">
                            <CardContent className="p-0">
                                <div className="border-b px-4 py-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">
                                                Select Facilities
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Checked facilities will be
                                                included in this cluster.
                                            </p>
                                        </div>

                                        {!!selectedCount && (
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                {selectedCount}
                                                selected
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-72 space-y-2 overflow-y-auto p-4">
                                    <Input
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search facilities"
                                    ></Input>
                                </div>
                                <div className="max-h-72 space-y-2 overflow-y-auto p-4">
                                    {filteredFacility.length > 0 ? (
                                        filteredFacility.map(
                                            (facility: FacilityType) => {
                                                const isSelected =
                                                    selectedFacilityIds.has(
                                                        Number(facility.id),
                                                    );

                                                const isDisabled =
                                                    facilitiesInUsed.has(
                                                        facility.facility_name,
                                                    );

                                                return (
                                                    <FacilityOptionRow
                                                        key={facility.id}
                                                        index={index}
                                                        isDisabled={isDisabled}
                                                        isSelected={isSelected}
                                                        handleCluster={
                                                            handleCluster
                                                        }
                                                        facility_name={
                                                            facility.facility_name
                                                        }
                                                        facilityId={facility.id}
                                                    ></FacilityOptionRow>
                                                );
                                            },
                                        )
                                    ) : (
                                        <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                                            {debounced!.trim()
                                                ? 'No matching facilities found.'
                                                : 'No facilities available for this selected area.'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t px-4 py-4">
                                    <p className="text-xs text-muted-foreground">
                                        {selectedCount}
                                        selected
                                    </p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShown(false)}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(ClusterFacilityListDropdown);
