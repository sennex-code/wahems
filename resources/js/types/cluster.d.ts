type FacilityOptionRow = {
    isDisabled: boolean;
    isSelected: boolean;
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        value: any,
        index?: number,
    ) => void;
    facility_name: string;
    index: number;
    facilityId: number;
};
