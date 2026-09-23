import { type InertiaFormProps } from '@inertiajs/react';
import { type JSX } from 'react';
import RegisterClusterForms from './register-cluster-forms';
import RegisterRegularForms from './register-regular-forms';

export type RenderRegisterForms = {
    event_type: EventTypeSelection;
    facility_name?: string;
    clusters?: ReturnedClusterType[];

    onChangeVal: (
        fieldName: keyof ParticipantType,
        value: string | number | boolean | null,
    ) => void;
    participantForm: InertiaFormProps<ParticipantType>;

    type?: 'Add' | 'Register';
};

// Determines what forms will be rendered
const RenderRegisterForms = ({
    event_type,
    clusters,
    facility_name,
    onChangeVal,
    participantForm,
    type,
}: RenderRegisterForms) => {
    // Cluster is only different since it requires different listing method
    const tmp: { [key: string]: string } = {
        Cluster: 'Cluster',
        Meeting: 'Regular',
        Workshop: 'Regular',
        Training: 'Regular',
    } as const;

    const newEventType = tmp[event_type];
    console.log(newEventType);
    // Render
    const registerForms: { [key: keyof typeof tmp]: JSX.Element } = {
        // Special function for rendering cluster forms
        Cluster: (
            <RegisterClusterForms
                clusters={clusters}
                participantForm={participantForm}
                onChangeVal={onChangeVal}
                type={type}
            ></RegisterClusterForms>
        ),
        // Regular forms
        Regular: (
            <RegisterRegularForms
                event_type={event_type}
                facility_name={facility_name}
                onChangeVal={onChangeVal}
                participantForm={participantForm}
                type={type}
            ></RegisterRegularForms>
        ),
    };

    return registerForms[newEventType];
};

export default RenderRegisterForms;
