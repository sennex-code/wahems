import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../lottie/404Error.json';
import { Head } from '@inertiajs/react';
type ErrorType = {
    status: number;
};

export default function Error({ status }: ErrorType) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
        405: 'test',
    }[status];

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
        405: 'test',
    }[status];
    return (
        <Empty className="flex min-h-screen w-screen items-center justify-center">
            <Head title="Not found :("></Head>
            <Lottie
                animationData={errorAnimation}
                loop={true}
                className="h-auto w-[40%]"
            />
            <EmptyHeader>
                <EmptyDescription>
                    {title}
                    <br></br>
                    {description}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
