import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Lottie from 'lottie-react';
import { motion } from 'motion/react';

import success from '../../lottie/success.json';

const AlreadyRegsitered = () => {
    return (
        <div className="m-auto my-auto flex min-h-screen w-screen items-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
            <motion.div
                className="mx-auto h-1/2"
                key={'show-register'}
                initial={{ opacity: 0.1, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <Card>
                    <div className="flex flex-col items-center justify-center">
                        <Lottie
                            animationData={success}
                            className="h-50 w-auto"
                        ></Lottie>
                    </div>
                    <CardContent className="flex flex-col items-center">
                        <div className="flex flex-row items-center justify-end font-bold">
                            You’re already registered! Your spot is secured —
                            see you at the event.
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default AlreadyRegsitered;
