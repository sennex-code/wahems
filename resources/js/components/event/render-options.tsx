import type { JSX } from 'react';

import { ClusterForms } from './cluster-forms';

import RegularForms from './regular-forms';
import TrainingForms from './training-forms';
type RenderOptionsType = {
    toRender: string;
    event: {
        region?: string;
        province?: string;
        municipality?: string;
        barangay?: string;
        facility_code?: string;
        address: string;
        cluster_name?: string;
        logo?: File | null | string;
        id?: string;
    };

    clusters: ClusterType[] | undefined;
    regions: RegionsType[];
    provinces: ProvinceType[];
    municipalities: MunicipalityType[];
    // barangays: BarangayType[];
    facilities: FacilityType[];
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value?: any,
        index?: number,
    ) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChangeInput: (name: keyof EventType, value: any) => void;
};

export const renderOptions = ({
    toRender,
    event,
    regions,
    provinces,
    municipalities,
    // barangays,
    facilities,
    clusters,
    onChangeInput,
    handleCluster,
}: RenderOptionsType) => {
    const render: { [key: string]: JSX.Element } = {
        Training: (
            <TrainingForms
                event={{ ...event, logo: event.logo ?? null }}
                regions={regions}
                provinces={provinces}
                municipalities={municipalities}
                // barangays={barangays}
                facilities={facilities}
                onChangeInput={onChangeInput}
            ></TrainingForms>
        ),
        Meeting: (
            <RegularForms
                event={{ ...event, logo: event.logo ?? undefined }}
                regions={regions}
                provinces={provinces}
                municipalities={municipalities}
                // barangays={barangays}
                onChangeInput={onChangeInput}
            ></RegularForms>
        ),
        Workshop: (
            <RegularForms
                event={{ ...event, logo: event.logo ?? undefined }}
                regions={regions}
                provinces={provinces}
                municipalities={municipalities}
                // barangays={barangays}
                onChangeInput={onChangeInput}
            ></RegularForms>
        ),
        Cluster: (
            <ClusterForms
                clusters={clusters}
                handleCluster={handleCluster}
                clusterAddress={event}
                regions={regions}
                provinces={provinces}
                municipalities={municipalities}
                // barangays={barangays}
                onChangeInput={onChangeInput}
            ></ClusterForms>
        ),
    };

    return render[toRender];
};
