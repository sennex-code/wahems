export const missingFields = <T extends Omit<EventType,'leader' | 'position'>>(
    eventData: T,
    step: number,
): (keyof T)[] => {
    const exam_type =
        eventData.type === 'Cluster' || eventData.type === 'Training'
            ? ['exam_bank' as keyof T]
            : [];

    const required_hours =
        eventData.type !== 'Meeting' ? ['required_hours' as keyof T] : [];

    if (step === 0) {
        return ['name', 'start_at', 'end_at', 'type', ...exam_type];
    }
    if (step === 1) {
        if (eventData.type === 'Training') {
            return [
                'region',
                'province',
                'municipality',
                // 'barangay',
                'facility_code',
                'address',
                // 'logo',
            ];
        }
        if (eventData.type === 'Meeting' || eventData.type === 'Workshop') {
            return [
                'region',
                'province',
                'municipality',
                // 'barangay',
                'address',
                // 'logo',
            ];
        }

        if (eventData.type === 'Cluster') {
            return [
                'region',
                'province',
                'municipality',
                // 'barangay',
                'address',
            ];
        }
    }

    if (step === 2) {
        if (eventData.type !== 'Cluster') {
            return [...required_hours];
        }
        if (eventData.type === 'Cluster') {
            return ['required_hours'];
        }
    }
    return [];
};

export const validateCluster = (
    cluster: ClusterType,
): (keyof ClusterType)[] => {
    const required: (keyof ClusterType)[] = [
        'region',
        'province',
        'municipality',
        // 'barangay',
        'cluster_name',
        'facilities',
        // 'logo',
    ];

    if (cluster.require_signatory) {
        required.push('signatory', 'position');
    }

    return required.filter((field) => {
        const value = cluster[field];

        if (Array.isArray(value)) {
            return value.length === 0;
        }

        return (
            value === undefined || value === null || value === '' || value === 0
        );
    });
};

export const getClusterMissing = (clusters: ClusterType[] = []) => {
    return clusters.map((cluster, index) => ({
        index,
        missing: validateCluster(cluster),
    }));
};
