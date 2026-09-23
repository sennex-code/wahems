import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from './ui/card';

const Missing = () => {
    return (
        <Card className="relative mx-5 my-auto">
            <CardContent className="flex flex-row">
                <img
                    src="/images/missing.png"
                    className="hidden h-auto w-md md:block"
                ></img>

                <div className="mx-auto flex flex-col">
                    <CardHeader className="flex-1 items-center justify-center">
                        <h1 className="text-center text-4xl font-extrabold">
                            We are sorry, but this page is not yet implemented!
                        </h1>
                        <p className="mt-5 text-xs opacity-50">Alpha v1.3</p>
                        <img
                            src="/images/missing.png"
                            className="my-2 h-auto w-[20%] md:hidden"
                        ></img>
                    </CardHeader>
                    <CardDescription className="text-md flex flex-3 flex-col gap-2 px-3 text-justify">
                        <p>
                            Due to the current development stage and our
                            organization's imposed time limit, some features and
                            functionalities on this page are not available at
                            the moment. However, our team is working diligently
                            to bring you the best experience possible, and we
                            appreciate your patience.
                        </p>
                        <p>
                            Rest assured that we are actively working on
                            implementing some of these features, and they will
                            be available in future updates. Unfortunately, those
                            that were initially required were dropped from this
                            alpha build; because of this, some features may or
                            may not be included in the development
                        </p>
                        <p>
                            In the meantime, if you have any questions or need
                            assistance, please feel free to reach out to our
                            support team. We understand that having all the
                            desired features is crucial for a smooth user
                            experience, and we are committed to continuously
                            improving our platform based on valuable feedback
                            from users like you. We value your input and strive
                            to make your experience with our platform
                            exceptional. Thank you for your understanding, and
                            we look forward to delivering a fully-featured and
                            seamless platform for you to enjoy.
                        </p>
                    </CardDescription>
                </div>
            </CardContent>
            <CardFooter className="absolute right-5 bottom-5">
                - TSU OJT TEAM
            </CardFooter>
        </Card>
    );
};

export default Missing;
