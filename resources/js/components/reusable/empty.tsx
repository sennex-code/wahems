import Lottie from 'lottie-react';
import { Card, CardContent } from '../ui/card';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
} from '../ui/empty';
import errorAnimation from '../../../lottie/NoResult.json';
const EmptyPlaceHolder = () => {
    return (
        <Card>
            <CardContent className="py-10">
                <Empty>
                    <Lottie
                        loop
                        className="h-auto w-55"
                        animationData={errorAnimation}
                    />
                    <EmptyHeader>
                        <EmptyDescription>
                            No attendance records were found
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </CardContent>
        </Card>
    );
};

export default EmptyPlaceHolder;
