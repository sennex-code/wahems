import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import Lottie from 'lottie-react';
import success from '../../../lottie/success.json';
import useQrReader from '@/hooks/queries/useQrReader';

type VerifyFaciSurveyType = {
    event: number;
};

const VerifyFaciSurvey = ({ event }: VerifyFaciSurveyType) => {
    const { errors } = usePage().props;
    const [code, setCode] = useState('');
    const [ready, setReady] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // ✅ Show error toast if attendance_code error exists
    useEffect(() => {
        if (errors.attendance_code) {
            toast.error(errors.attendance_code, {
                position: 'top-center',
            });
        }
    }, [errors]);

    const verify = () => {
        const attendance_code = code.trim();
        if (!attendance_code) return;

        setIsVerifying(true);

        router.post(
            route('facilitator-surveys.verify', {
                event,
            }),
            {
                attendance_code,
            },
            {
                onSuccess: () => {
                    toast.success('Success! Redirecting to evaluation...', {
                        position: 'top-center',
                    });
                    setIsVerifying(false);
                },
                onError: (e: any) => {
                    setIsVerifying(false);
                    // ✅ Error is already shown in useEffect
                },
            }
        );
    };

    const cancel = () => {
        window.close();
        setTimeout(() => {
            try {
                window.history.back();
            } catch {}
        }, 100);
    };

    const { inputRef, textRef, qr, scanning, startScanner, stopScanner } =
        useQrReader({
            readerId: 'facilitator-survey-verification-reader',
            setVerificationCode: (val) => {
                const v =
                    typeof val === 'string'
                        ? val.trim()
                        : String(val ?? '').trim();

                setCode(v);
                setReady(v.length > 0);
            },
        });

    useEffect(() => {
        if (ready) stopScanner();
    }, [ready, stopScanner]);

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <motion.div
                key="verify-facilitator-survey"
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card className="max-w-105 min-w-25 px-5 py-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center">
                            <img
                                src="/images/JHUWan-Modern.png"
                                alt="Logo"
                                className="float-anim mb-4"
                            />

                            <div className="mb-4 text-center">
                                <div className="text-lg font-semibold text-white">
                                    Facilitator Evaluation Verification
                                </div>
                                <div className="text-sm text-white/70">
                                    Scan or upload your QR, or enter your
                                    attendance code to continue.
                                </div>
                            </div>

                            <div className="w-full">
                                {/* QR Scanner */}
                                <div
                                    id="facilitator-survey-verification-reader"
                                    className={[
                                        'w-full overflow-hidden rounded-md bg-black/30 transition-[height,margin] duration-200',
                                        scanning ? 'mb-4 h-70' : 'mb-0 h-0',
                                    ].join(' ')}
                                />

                                {/* QR and Upload Buttons */}
                                <div className="mb-4 flex gap-2">
                                    {!scanning ? (
                                        <Button
                                            type="button"
                                            onClick={startScanner}
                                            className="w-1/2"
                                        >
                                            Scan QR
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={stopScanner}
                                            className="w-1/2"
                                        >
                                            Stop
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-1/2"
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    >
                                        Upload QR
                                    </Button>

                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={qr.mutate}
                                    />
                                </div>
                            </div>

                            {/* Attendance Code Input */}
                            <Field className="w-full max-w-sm">
                                <FieldLabel>Verification Code</FieldLabel>
                                <InputGroup ref={textRef as any}>
                                    <InputGroupInput
                                        value={code}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCode(v);
                                            setReady(v.trim().length > 0);
                                        }}
                                        placeholder="Enter your attendance code"
                                        disabled={isVerifying}
                                    />
                                </InputGroup>

                                {/* Action Buttons */}
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={cancel}
                                        className="w-full"
                                        disabled={isVerifying}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={verify}
                                        disabled={!ready || isVerifying}
                                        className="w-full"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Submit'}
                                    </Button>
                                </div>
                            </Field>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyFaciSurvey;