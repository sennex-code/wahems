/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, useForm } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { initialValue } from '@/constants/constant';
import { getClusterMissing, missingFields } from './utils/missingFields.utils';

const useEventHandler = () => {
    // Form itself
    const event = useForm<EventType>(initialValue);

    const isValid = (value: unknown) => {
        return !(
            value === undefined ||
            value === null ||
            value === '' ||
            value === 0
        );
    };

    // T can be anything
    const getRequiredFields = <T extends Record<string, unknown>>(
        data: T,
        fields: (keyof T)[],
    ) => {
        return fields.filter((field) => !isValid(data[field]));
    };

    // Setters for delete function
    const [isDeleteShown, toggleDeleteModal] = useState<boolean>(false);
    const [eventId, setEventId] = useState<number | null>(null);
    // Handle input change
    const onChangeInput = useCallback(
        (fieldName: keyof EventType, value: any) => {
            // Empties next dropdown if new region select

            if (fieldName === 'region') {
                event.setData((prev: EventType) => ({
                    ...prev,
                    region: value,
                    province: '',
                    municipality: '',
                    // barangay: '',
                    facility_code: '',
                }));
                return;
            }
            // Empties next dropdown if new province select
            if (fieldName === 'province') {
                event.setData((prev: EventType) => ({
                    ...prev,
                    province: value,
                    municipality: '',
                    // barangay: '',
                    facility_code: '',
                }));
                return;
            }
            // Empties next dropdown if new municipality select
            if (fieldName === 'municipality') {
                event.setData((prev: EventType) => ({
                    ...prev,
                    municipality: value,
                    // barangay: '',
                    facility_code: '',
                }));
                return;
            }
            // Add the input to respective field
            console.log(fieldName, value);

            event.setData(fieldName, value);
        },
        [event],
    );

    // Handles cluster types
    const handleCluster = useCallback(
        (
            fieldName: keyof ClusterType | 'addNew' | 'delete',
            value?: any,
            index?: number,
        ) => {
            if (fieldName === 'addNew') {
                event.setData('clusters', [
                    ...(event.data.clusters ?? []),
                    {
                        id: null,
                        region: '',
                        province: '',
                        municipality: '',
                        // barangay: '',
                        cluster_name: '',
                        logo: null,
                        facilities: [],
                        signatory: null,
                        position: null,
                        require_signatory: false,
                    },
                ]);
                return;
            }

            if (fieldName === 'delete') {
                if (event.data.clusters?.length === 1) {
                    toast.error('Cannot delete first Cluster!');
                    return;
                }

                const newCluster = (event.data.clusters ?? []).filter(
                    (_, i) => i !== index,
                );
                event.setData('clusters', newCluster);
                return;
            }

            if (index === undefined) return;

            const newCluster = (event.data.clusters ?? []).map((cluster, i) => {
                if (i !== index) return cluster;

                if (fieldName === 'region') {
                    return {
                        ...cluster,
                        region: value,
                        province: '',
                        municipality: '',
                        // barangay: '',
                        facilities: [],
                    };
                }

                if (fieldName === 'province') {
                    return {
                        ...cluster,
                        province: value,
                        municipality: '',
                        // barangay: '',
                        facilities: [],
                    };
                }

                if (fieldName === 'municipality') {
                    return {
                        ...cluster,
                        municipality: value,
                        // barangay: '',
                        facilities: [],
                    };
                }

                if (fieldName === 'facilities') {
                    const currentCluster = (cluster.facilities ?? []).map(
                        (f: any) => (typeof f === 'number' ? f : Number(f.id)),
                    );
                    const numericValue = Number(value);

                    if (currentCluster.includes(numericValue)) {
                        return {
                            ...cluster,
                            facilities: currentCluster.filter(
                                (f) => f !== numericValue,
                            ),
                        };
                    }

                    return {
                        ...cluster,
                        facilities: [...currentCluster, numericValue],
                    };
                }
                if (fieldName === 'require_signatory') {
                    const enabled = Boolean(value);

                    return {
                        ...cluster,
                        require_signatory: enabled,
                        signatory: enabled ? cluster.signatory : null,
                        position: enabled ? cluster.position : null,
                    };
                }
                return { ...cluster, [fieldName]: value };
            });

            event.setData('clusters', newCluster);
        },
        [event.data.clusters, event.setData],
    );
    // Handle submit form
    const onSubmit = (e: any, onSuccessClose?: () => void) => {
        e.preventDefault();
        if (pageOneMissing.length > 0) {
            toast.error(
                `${pageOneMissing.length} required field(s) missing on page 1`,
                {
                    description: pageOneMissing.join(', '),
                },
            );
            return;
        }

        if (
            (event.data.type === 'Workshop' ||
                event.data.type === 'Meeting' ||
                event.data.type === 'Training') &&
            pageTwoMissing.length > 0
        ) {
            toast.error(
                `${pageTwoMissing.length} required field(s) missing on page 2`,
                {
                    description: pageTwoMissing.join(', '),
                },
            );
            return;
        }

        if (event.data.type === 'Cluster') {
            const firstInvalidCluster = clusterMissing.find(
                (item) => item.missing.length > 0,
            );

            if (firstInvalidCluster) {
                toast.error('Cluster details are incomplete', {
                    description: `Cluster ${firstInvalidCluster.index + 1}: ${firstInvalidCluster.missing.join(', ')}`,
                });
                return;
            }
        }

        if (pageThreeMissing.length > 0) {
            toast.error(
                `${pageThreeMissing.length} required field(s) missing on page 3`,
                {
                    description: pageThreeMissing.join(', '),
                },
            );
            return;
        }
        // Cleanup before sending
        event.transform((payload) => {
            if (payload.type === 'Cluster') {
                console.log(payload);

                const { facility_code, ...rest } = payload;

                return rest;
            }
            if (payload.type === 'Training') {
                const { clusters, ...rest } = payload;
                console.log(rest);
                return rest;
            }
            if (payload.type === 'Workshop' || payload.type === 'Meeting') {
                const { clusters, facility_code, ...rest } = payload;
                console.log(rest);
                return rest;
            }

            return payload;
        });

        event.post('/create-event', {
            // Image upload
            forceFormData: true,
            onSuccess: () => {
                toast.success('Success Create Event!');
                onSuccessClose?.();
                event.reset();
            },
            onError: (e) => {
                toast.error('Failed to Create Event!');
                console.log(e);
            },
        });
    };

    const onUpdateEvent = (e: any) => {
        // console.log(event.data);
        e.preventDefault();

        event.transform((payload) => {
            if (payload.type === 'Cluster') {
                const { facility_code, ...rest } = payload;

                return rest;
            }
            if (payload.type === 'Training') {
                const { clusters, ...rest } = payload;
                console.log(rest);
                return rest;
            }
            if (payload.type === 'Workshop' || payload.type === 'Meeting') {
                const { clusters, facility_code, ...rest } = payload;
                console.log(rest);
                return rest;
            }

            return payload;
        });

        event.put(route('event.update', event.data.id), {
            onSuccess: () => {
                toast.success('Event updated!');
            },
            onError: (error) => {
                console.log(error);
                toast.error('Failed to Updated!');
            },
        });
    };

    const handleDelete = (eventId: number) => {
        router.delete(route('event.destroy', { eventId: eventId }), {
            onSuccess: (e) => {
                toast.success('Event Deleted!');
                toggleDeleteModal(false);
            },
        });
    };

    const exportXLXS = (eventId: number) => {
        if (!eventId) {
            toast.error('No eventid');
            return;
        }
        window.location.href = `/event/export/${eventId}`;
    };

    const pageOneMissing = useMemo(() => {
        console.log(event.data);
        return getRequiredFields(event.data, missingFields(event.data, 0));
    }, [event.data]);

    const pageTwoMissing = useMemo(() => {
        return getRequiredFields(event.data, missingFields(event.data, 1));
    }, [event.data]);

    const pageThreeMissing = useMemo(() => {
        return getRequiredFields(event.data, missingFields(event.data, 2));
    }, [event.data]);

    const clusterMissing = useMemo(() => {
        return getClusterMissing(event.data.clusters ?? []);
    }, [event.data.clusters]);

    // Exports ALL;
    return {
        pageOneMissing,
        pageThreeMissing,
        clusterMissing,
        pageTwoMissing,
        exportXLXS,
        event,
        onChangeInput,
        handleCluster,
        onSubmit,
        onUpdateEvent,
        handleDelete,
        isDeleteShown,
        toggleDeleteModal,
        eventId,
        setEventId,
    };
};

export default useEventHandler;
