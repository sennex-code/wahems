/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import RenderRegisterForms from '@/components/attendance/forms/render-register-forms';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const UserRegistration = ({ event }: any) => {
    const participantForm = useForm<ParticipantType>();

    const onChangeVal = (
        fieldName: keyof ParticipantType,
        value: string | number | boolean | null,
    ) => {
        participantForm.setData(fieldName, value);
    };

    const onRegisterParticipant = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        participantForm.transform((dataset) => {
            const payload = { ...dataset };

            if (event.type === 'Training') {
                payload.facility_name = event.facility;
            }

            if (!dataset.cpd) {
                const { cpd, prc_license, expiry_date, ...rest } = payload;
                return rest;
            }

            return payload;
        });

        participantForm.post(
            route('user-registration-form.post', { event: event.id }),
            {
                onSuccess: () => {
                    return;
                },
                onError: () => {
                    console.log(participantForm.data);
                    toast.error('Failed to Register!');
                    return;
                },
            },
        );
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                <Card className="w-full overflow-hidden rounded-xl border shadow-lg">
                    <CardHeader className="px-4 pt-6 sm:px-6">
                        <h1 className="text-center text-lg font-extrabold sm:text-xl md:text-2xl">
                            Event Registration for {event.name}
                        </h1>
                        <p className="mx-auto max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
                            Complete the form to register for the event and
                            receive your attendance code. Thank you!
                        </p>
                    </CardHeader>

                    <CardContent className="px-4 pb-6 sm:px-6">
                        <Card className="w-full rounded-lg">
                            <CardContent className="p-4 sm:p-6">
                                <form
                                    method="post"
                                    onSubmit={onRegisterParticipant}
                                    className="space-y-4"
                                >
                                    {RenderRegisterForms({
                                        event_type: event.type,
                                        clusters: event.clusters,
                                        facility_name: event.facility,
                                        participantForm,
                                        onChangeVal,
                                        type: 'Register',
                                    })}
                                </form>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserRegistration;
