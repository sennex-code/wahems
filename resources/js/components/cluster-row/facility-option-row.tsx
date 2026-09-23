import React from 'react';
import { Checkbox } from '../ui/checkbox';

const FacilityOptionRow = ({
    isDisabled,
    isSelected,
    handleCluster,
    facility_name,
    index,
    facilityId,
}: FacilityOptionRow) => {
    return (
        <label
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-accent/30'
            } ${isSelected ? 'border-primary/40 bg-accent/20' : ''}`}
        >
            <Checkbox
                checked={isSelected}
                disabled={isDisabled}
                onCheckedChange={() =>
                    handleCluster('facilities', facilityId, index)
                }
                className="mt-0.5"
            />

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{facility_name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {isDisabled
                        ? 'Unavailable because it already has registered participants'
                        : isSelected
                          ? 'Selected'
                          : 'Available'}
                </p>
            </div>
        </label>
    );
};

export default React.memo(FacilityOptionRow);
