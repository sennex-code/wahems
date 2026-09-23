/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useForm } from '@inertiajs/react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

import { route } from 'ziggy-js';

type ParticpantHandlerType = {
    event: {
        type: string;
        facility: string;
        id: string;
    };
    participantId?: string | undefined;
    closeEditModal: () => void;
};
export const participantHandler = ({
    event,
    participantId,
    closeEditModal,
}: ParticpantHandlerType) => {
    const participantForm = useForm<ParticipantType>();
    const onChangeVal = (
        fieldName: keyof ParticipantType,
        value: string | number | boolean | null,
    ) => {
        participantForm.setData(fieldName, value);
    };

    const onCreateNewParticipant = (e: any) => {
        e.preventDefault();
        participantForm.transform((dataset) => {
            if (event.type === 'Training') {
                return { ...dataset, facility_name: event.facility };
            }
            return dataset;
        });
        participantForm.post(
            route('create-participant-form.post', { event: event.id }),
            {
                onSuccess: () => {
                    participantForm.reset();
                    toast.success('User Registered!');
                    closeEditModal();
                    return;
                },
                onError: (error) => {
                    console.log(error);

                    toast.error('Failed to Register!');
                    return;
                },
            },
        );
    };

    const onUpdateParticipant = (e: any) => {
        e.preventDefault();
        // participantForm.transform((dataset) => {

        //     const { facility_name, ...rest } = dataset;
        //     return rest;
        // });

        if (!participantId) {
            toast.error('No participant selected.');
            return;
        }

        console.log(event.id);
        participantForm.put(
            route('update-user.update', {
                eventId: event.id,
                participant: participantId,
            }),
            {
                onSuccess: () => {
                    toast.success('User Updated!!', {
                        position: 'top-center',
                    });

                    participantForm.reset();

                    closeEditModal();
                    window.location.reload();
                },
                onError: (error) => {
                    console.log(error);
                    console.log(participantId);
                    toast.error('Failed to Update!', {
                        position: 'top-center',
                    });
                    return;
                },
            },
        );
    };

    return {
        onChangeVal,
        onCreateNewParticipant,
        onUpdateParticipant,
        participantForm,
    };
};
