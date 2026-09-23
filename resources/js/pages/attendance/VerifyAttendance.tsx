import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { motion } from 'motion/react';
import success from '../../../lottie/success.json';
import Lottie from 'lottie-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { toast } from 'sonner';

import useQrReader from '@/hooks/queries/useQrReader';
import { Input } from '@/components/ui/input';

type VerifySurveyType = {
    survey: number;
    eventId: number;
};

const VerifyAttendance = ({ survey, eventId }: VerifySurveyType) => {
    const [verificationCode, setVerificationCode] = useState<
        string | undefined
    >();

    const verify = () => {
        const date = new Date().toISOString().split('T')[0];

        router.patch(
            route('attendanceSubmission.patch', { eventId }),
            {
                attendance_code: verificationCode,
                date_on: date,
            },
            {
                onSuccess: (e: any) => {
                    console.log(date, verificationCode);

                    toast.success('Recorded!');
                },
                onError: (e) => {
                    if (e.no_participant) {
                        toast.error(e.no_participant, {
                            position: 'top-center',
                        });
                        return;
                    }
                    if (e.no_attendance) {
                        toast.error(e.no_attendance, {
                            position: 'top-center',
                        });
                        return;
                    }
                    if (e.already_recorded) {
                        toast.error(e.already_recorded, {
                            position: 'top-center',
                        });
                        return;
                    }
                },
            },
        );
    };
    const { inputRef, qr, textRef } = useQrReader({
        setVerificationCode,
    });

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <motion.div
                key={'show-verify'}
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card className="px-5">
                    <div className="flex flex-col items-center justify-center">
                      <img
                                        src="/images/JHUWan-Modern.png"
                                        alt=""
                                        className="float-anim"
                                        />
                        <div className="w-125" id="reader"></div>
                        <Field className="max-w-sm">
                            <FieldLabel htmlFor="inline-end-input">
                                Uploade QR Code
                            </FieldLabel>

                            <Input
                                ref={inputRef}
                                type="file"
                                onChange={qr.mutate}
                                id="qr-reader"
                                placeholder="Enter your Attendance code"
                            />
                        </Field>

                        <Label className="my-5">OR</Label>

                        <Field className="max-w-sm">
                            <FieldLabel htmlFor="inline-end-input">
                                Verification Code
                            </FieldLabel>
                            <InputGroup className="" ref={textRef}>
                                <InputGroupInput
                                    value={verificationCode ?? ''}
                                    onChange={(e) =>
                                        setVerificationCode(e.target.value)
                                    }
                                    id="inline-end-input"
                                    placeholder="Enter your Attendance code"
                                />
                            </InputGroup>
                            <Button
                                onClick={() => verify()}
                                disabled={!verificationCode}
                            >
                                Submit
                            </Button>
                        </Field>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyAttendance;
