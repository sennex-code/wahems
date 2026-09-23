import React from 'react';
import inactive from '../../../lottie/inactive.json';
import Lottie from 'lottie-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';

type InactiveProps = {
    type: 'Survey' | 'Exam' | 'Event'|'Evaluation';
};

const Inactive = ({ type }: InactiveProps) => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <Head title="Not found :("></Head>

            <Card className="w-full max-w-xl border-none shadow-none">
                <CardContent className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
                    <Lottie
                        animationData={inactive}
                        loop={true}
                        className="h-52 w-52 md:h-64 md:w-64"
                    />

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            {type} Unavailable
                        </h1>
                        <p className="text-sm text-muted-foreground md:text-base">
                            This {type} is currently inactive or temporarily
                            closed. Please check again later or contact the
                            event organizer for more information.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="mt-2"
                    >
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Inactive;
