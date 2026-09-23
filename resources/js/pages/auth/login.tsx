import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status }: Props) {
    const [isDTSShown, toggleDTS] = useState<boolean>(false);
    return (
        <>
            <div className="gradient-to-br to-purple-8000 relative flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-indigo-950 via-purple-900 px-6">
                {/* <div className="absolute bottom-0 left-0 m-0 h-200 w-300 bg-[url('/images/juWAH.png')] bg-cover p-0"></div>
                 */}

                <Card className="flex h-150 flex-row p-0">
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src="/images/wahIcon.png"
                            className="h-auto w-50"
                        ></img>
                        <h1 className="text-center text-xl font-extrabold">
                            Wireless Access for Health
                        </h1>
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="mx-9 flex w-[50%]"
                    >
                        {({ processing, errors }) => (
                            <div className="flex flex-1 flex-col justify-center">
                                <h1 className="text-xs">
                                    <span className="text-2xl font-bold">
                                        {' '}
                                        Welcome back
                                    </span>
                                    ,<br></br> please login to your account.
                                </h1>

                                <div className="grid-2 grid gap-10">
                                    <div className="mt-5 flex flex-col gap-10">
                                        <div>
                                            <Label htmlFor="email">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="">
                                            <Label htmlFor="email">
                                                Password
                                            </Label>

                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                            <div className="mt-3 flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                />
                                                <Label htmlFor="remember">
                                                    Remember me
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mx-auto mt-4 w-[50%]"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        Log in
                                    </Button>

                                    <a
                                        className="mx-atuo text-xs"
                                        type="button"
                                        onClick={() =>
                                            toggleDTS((prev) => !prev)
                                        }
                                    >
                                        DTS
                                    </a>
                                </div>
                            </div>
                        )}
                    </Form>
                </Card>

                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
            <Dialog open={isDTSShown} onOpenChange={toggleDTS}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>WAHEMS Privacy Statement</DialogTitle>
                    </DialogHeader>
                    <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <p key={index} className="mb-4 leading-normal">
                                WAHEMS Privacy Statement Close modal
                                Introduction WAHEMS respects your individual
                                privacy and protects any personal information
                                that you share with us. We commit to secure the
                                individual’s right to privacy and ensure the
                                trustworthiness of processing of individual’s
                                personal information. WAHEMS strives to comply
                                with the Data Privacy Act of 2012 that is
                                designed to protect your privacy. We intend to
                                adhere to the principles set forth in this
                                Privacy Statement and recognize your need for
                                appropriate protection and management of any
                                personal information. In other words, our goal
                                is to provide protection for your privacy
                                regardless of what types of device or
                                application to access our Services. By using our
                                Services, you consent to the collection,
                                storage, processing, transferring, disclosure,
                                and other usage of the Information described in
                                this Privacy Statement and Terms of Service
                                Agreement. Personal Data Collected We may
                                collect, store and process the following
                                information: First Name Middle Initial Last Name
                                Suffix Age Gender Mobile Number Email Address
                                Designation Purpose of Collected Data You
                                consent that your collected Personal Information
                                may be used To help improve our data and
                                services and customize user experience; To
                                deliver the products and services that you have
                                requested; To perform research and analysis
                                about your use of, or interest in, our products,
                                services, or content, or products, services or
                                content offered by others; To provide better
                                customer experience to the Provincial Government
                                clients and improve, develop, identify and
                                implement services; To follow safety, security,
                                public service or legal requirements and
                                processes; To process information for
                                statistical, analytical, and research purposes;
                                and To identify and prevent errors and
                                inefficiencies due to misuse of the platform; To
                                enforce our terms and conditions; How data is
                                collected Wireless Access for Health utilizes a
                                registration website to collect personal
                                information from health care providers, where
                                they can utilize QR code technology to
                                streamline the attendance checking process.
                                Health care providers are required to provide
                                their personal information, such as name,
                                contact details, and other relevant data,
                                through the platform. With the QR code system in
                                place, attendance tracking becomes highly
                                efficient, allowing for easy and accurate
                                monitoring of health care provider attendance.
                                Additionally, the system can generate
                                attendance-based certificates, providing a
                                convenient way to verify attendance of health
                                care providers attending the WAH training. Our
                                Disclosure of your Personal Information to Third
                                Parties WAH does not share any information
                                collected from the WAH Attendance with other
                                government agencies, companies, organizations,
                                and individuals outside of Wireless Access for
                                Health Initiative. Limiting Use, Disclosure,
                                Retention WAHEMS identifies the purposes for
                                which the information is being collected before
                                or at the time of collection. The collection of
                                your personal information will be limited to
                                that which is needed for the purposes identified
                                by us. Unless you consent or we are required by
                                law, we will only use the information for the
                                purposes for which it was collected. If we will
                                be processing your personal data for another
                                purpose later on, we will seek your further
                                legal permission or consent; except where the
                                other purpose is compatible with the original
                                purpose. We will keep your personal data only as
                                long as required to serve those purposes. We
                                will also retain and use your personal data for
                                as long as necessary to comply with our legal
                                obligations, resolve disputes, and enforce our
                                agreements. Accuracy of Personal data We do our
                                best to ensure that the personal data we hold
                                and use is accurate. We rely on the clients we
                                do business with to disclose to us all relevant
                                information and to inform us of any changes. How
                                data is protected (Storage, Security, Disposal
                                and Retention) We prioritize the security of
                                your information and have implemented
                                comprehensive measures to prevent unauthorized
                                access or disclosure. These measures encompass
                                organizational, physical, and technical security
                                protocols, which adhere to established security
                                standards. We employ a combination of electronic
                                and managerial procedures to safeguard and
                                secure the information we collect, ensuring its
                                confidentiality and integrity. Wireless Access
                                for Health store your personal information with
                                third-party data storage providers (cloud), we
                                shall ensure that proper measures are adopted to
                                protect your information. According to the
                                Privacy Guidelines for the Implementation of the
                                Philippine Health Information Exchange, all
                                personal health information collected and stored
                                in the system should be retained for as long as
                                necessary to serve the declared purposes.
                                However, after a period of fifteen (15) years of
                                inactivity from the last transaction, electronic
                                copies of all records should be securely
                                destroyed following established protocols.
                                Changes to our Privacy Statement WAHEMS may
                                amend this statement at any time by posting a
                                new version. It is your responsibility to review
                                this statement periodically as your continued
                                use of our products and services represents your
                                agreement with the then-current statement.
                                Rights of the Data Subject (RA 10173 Data
                                Privacy Act of 2012) Right of erasure or
                                blocking. You may have a broader right to
                                erasure of personal data that we hold about you.
                                Right to object. You may have the right to
                                request that we stop processing your personal
                                data and/or to stop sending you marketing
                                communications. Right to restrict processing.
                                You may have the right to request that we
                                restrict processing of your personal data in
                                certain circumstances. Right to restrict
                                processing. You may have the right to request
                                that we restrict processing of your personal
                                data in certain circumstances. Right to access.
                                In certain circumstances, you may have the right
                                to be provided with your personal data in a
                                structured, machine readable and commonly used
                                format and to request that we transfer the
                                personal data to another data controller without
                                hindrance. If you would like to exercise any of
                                the above rights, please contact our support
                                team or contact our Data Protection Officer. We
                                will consider your request in accordance with
                                applicable laws. To protect your privacy and
                                security, we may take steps to verify your
                                identity before complying with the request. You
                                also have the right to complain to a data
                                protection authority about our collection and
                                use of your personal data. How to file a
                                complaint If there is a complaint regarding the
                                processing of personal data, please contact the
                                Data Protection Officer listed below. It is the
                                right of the Data subject to lodge a complaint
                                with the Wireless Access for Health to protect
                                its personal information. If you have any
                                questions regarding the Wireless Access for
                                Health please send an email to:
                                wah.pilipinas@wah.ph Data Protection Officer
                                Contact Details You may get in touch with
                                Wireless Access for Health through our Data
                                Protection Officer with the contact details
                                listed below: Name: Kevin Greg Alvarado Tel.no:
                                (045) 985-5607 Email: Privacy@wah.ph Address:
                                2nd Floor Diwa ng tarlac building, San Vicente,
                                Tarlac City, 2300
                            </p>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
