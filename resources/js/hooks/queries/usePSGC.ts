import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type PSGCType = {
    region: string | undefined;
    province: string | undefined;
    municipality: string | undefined;
    barangay?: string | undefined;
};

export const usePSGC = ({
    region,
    province,
    municipality,
    barangay,
}: PSGCType) => {
    const regions = useQuery({
        queryKey: ['regions'],
        queryFn: async () => {
            const { data } = await axios.get('/get-regions');
            return data.regions;
        },
    });

    const provinces = useQuery({
        queryKey: ['provinces', region],
        queryFn: async () => {
            const { data } = await axios.get(`/get-provinces/${region}`);
            return data.provinces;
        },
        enabled: !!region,
    });

    const municipalities = useQuery({
        queryKey: ['municipalities', province],
        queryFn: async () => {
            const { data } = await axios.get(`/get-municipalities/${province}`);
            return data.municipalities;
        },
        enabled: !!region && !!province,
    });

    const barangays = useQuery({
        queryKey: ['barangays', municipality],
        queryFn: async () => {
            const { data } = await axios.get(`/get-barangay/${municipality}`);
            return data.barangays;
        },
        enabled: !!municipality && !!region && !!province,
    });

    const facilities = useQuery({
        queryKey: ['facilities', municipality],
        queryFn: async () => {
            const { data } = await axios.get(
                `/get-facilities/${encodeURIComponent(municipality!)}`,
            );
            return data.facilities as FacilityType[];
        },
        enabled: !!municipality && !!region && !!province
    });

    return { regions, provinces, municipalities, facilities, barangays };
};