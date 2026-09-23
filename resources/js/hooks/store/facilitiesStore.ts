import { create } from 'zustand';

type FacilityStoreType = {
    facilitiesInUsed: string[];
    clustersInUsed: number[];
    setFacilitiesInUsed: (payload: string[]) => void;
    setClustersInUsed: (payload: number[]) => void;
};

export const useFacilitiesStore = create<FacilityStoreType>()((set) => ({
    facilitiesInUsed: [],
    clustersInUsed: [],
    setClustersInUsed: (payload) => set({ clustersInUsed: payload }),
    setFacilitiesInUsed: (payload) => set({ facilitiesInUsed: payload }),
}));
