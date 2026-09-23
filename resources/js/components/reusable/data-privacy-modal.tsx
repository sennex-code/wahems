import { Check, LucideIcon, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent, CardDescription } from '../ui/card';
import {
    DialogHeader,
    Dialog,
    DialogContent,
    DialogDescription,
} from '../ui/dialog';
import {
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    Item,
} from '../ui/item';
import { Label } from '../ui/label';
import { Dispatch, SetStateAction } from 'react';
import {
    dataProtectionOfficerDetails,
    personalDataCollectedWithIcons,
    purposes,
    rights,
} from '@/constants/constant';

type DataPrivacyModalProps = {
    isDtsShown: boolean;
    toggleDts: Dispatch<SetStateAction<boolean>>;
};

const DataPrivacyModal = ({ isDtsShown, toggleDts }: DataPrivacyModalProps) => {
    return (
        <Dialog open={isDtsShown} onOpenChange={toggleDts}>
            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-xl p-0 sm:w-[92vw] sm:rounded-2xl">
                <DialogHeader className="shrink-0 border-b bg-muted/40 px-4 py-4 sm:px-6">
                    <div className="space-y-1">
                        <h2 className="text-lg font-extrabold sm:text-xl">
                            WAHEMS Privacy Statement
                        </h2>
                        <DialogDescription className="text-sm leading-6">
                            Please read how Wireless Access for Health collects,
                            uses, protects, and retains your personal data.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    <div className="space-y-4 sm:space-y-5">
                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Introduction
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    WAHEMS respects your individual privacy and
                                    protects any personal information that you
                                    share with us. We commit to secure the
                                    individual’s right to privacy and ensure the
                                    trustworthiness of processing of
                                    individual’s personal information.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    WAHEMS strives to comply with the Data
                                    Privacy Act of 2012 that is designed to
                                    protect your privacy. We intend to adhere to
                                    the principles set forth in this Privacy
                                    Statement and recognize your need for
                                    appropriate protection and management of any
                                    personal information. In other words, our
                                    goal is to provide protection for your
                                    privacy regardless of what types of device
                                    or application are used to access our
                                    Services. By using our Services, you consent
                                    to the collection, storage, processing,
                                    transferring, disclosure, and other usage of
                                    the Information described in this Privacy
                                    Statement and Terms of Service Agreement.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <div>
                                    <Label className="text-base font-semibold">
                                        Personal Data Collected
                                    </Label>
                                    <CardDescription className="mt-1">
                                        We may collect, store, and process the
                                        following information:
                                    </CardDescription>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    {personalDataCollectedWithIcons.map(
                                        (item: {
                                            label: string;
                                            icon: LucideIcon;
                                        }) => (
                                            <Item
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                key={item.label}
                                            >
                                                <ItemMedia>
                                                    <item.icon className="h-4 w-4" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>
                                                        {item.label}
                                                    </ItemTitle>
                                                </ItemContent>
                                            </Item>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <div>
                                    <Label className="text-base font-semibold">
                                        Purpose of Collected Data
                                    </Label>
                                    <CardDescription className="mt-1">
                                        You consent that your collected personal
                                        information may be used for the
                                        following purposes:
                                    </CardDescription>
                                </div>

                                <div className="space-y-2">
                                    {purposes.map(
                                        (purpose: string, index: number) => (
                                            <Item
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                key={index}
                                            >
                                                <ItemMedia>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>
                                                        {purpose}
                                                    </ItemTitle>
                                                </ItemContent>
                                            </Item>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    How Data is Collected
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    Wireless Access for Health utilizes a
                                    registration website to collect personal
                                    information from health care providers,
                                    where they can utilize QR code technology to
                                    streamline the attendance checking process.
                                    Health care providers are required to
                                    provide their personal information, such as
                                    name, contact details, and other relevant
                                    data, through the platform.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    With the QR code system in place, attendance
                                    tracking becomes highly efficient, allowing
                                    for easy and accurate monitoring of health
                                    care provider attendance. Additionally, the
                                    system can generate attendance-based
                                    certificates, providing a convenient way to
                                    verify attendance of health care providers
                                    attending the WAH training.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Disclosure of Personal Information to Third
                                    Parties
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    WAH does not share any information collected
                                    from the WAH Attendance system with other
                                    government agencies, companies,
                                    organizations, or individuals outside of the
                                    Wireless Access for Health Initiative.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Limiting Use, Disclosure, and Retention
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    WAHEMS identifies the purposes for which the
                                    information is being collected before or at
                                    the time of collection. The collection of
                                    your personal information will be limited to
                                    that which is needed for the purposes
                                    identified by us.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    Unless you consent or we are required by
                                    law, we will only use the information for
                                    the purposes for which it was collected. If
                                    we process your personal data for another
                                    purpose later on, we will seek your further
                                    legal permission or consent, except where
                                    the other purpose is compatible with the
                                    original purpose.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    We will keep your personal data only as long
                                    as required to serve those purposes. We will
                                    also retain and use your personal data for
                                    as long as necessary to comply with our
                                    legal obligations, resolve disputes, and
                                    enforce our agreements.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Accuracy of Personal Data
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    We do our best to ensure that the personal
                                    data we hold and use is accurate. We rely on
                                    the clients we do business with to disclose
                                    to us all relevant information and to inform
                                    us of any changes.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    How Data is Protected
                                </Label>
                                <CardDescription>
                                    Storage, Security, Disposal, and Retention
                                </CardDescription>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    We prioritize the security of your
                                    information and have implemented
                                    comprehensive measures to prevent
                                    unauthorized access or disclosure. These
                                    measures encompass organizational, physical,
                                    and technical security protocols, which
                                    adhere to established security standards.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    We employ a combination of electronic and
                                    managerial procedures to safeguard and
                                    secure the information we collect, ensuring
                                    its confidentiality and integrity.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    Wireless Access for Health stores your
                                    personal information with third-party data
                                    storage providers (cloud), and we ensure
                                    that proper measures are adopted to protect
                                    your information. According to the Privacy
                                    Guidelines for the Implementation of the
                                    Philippine Health Information Exchange, all
                                    personal health information collected and
                                    stored in the system should be retained for
                                    as long as necessary to serve the declared
                                    purposes.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    However, after a period of fifteen (15)
                                    years of inactivity from the last
                                    transaction, electronic copies of all
                                    records should be securely destroyed
                                    following established protocols.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Changes to our Privacy Statement
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    WAHEMS may amend this statement at any time
                                    by posting a new version. It is your
                                    responsibility to review this statement
                                    periodically, as your continued use of our
                                    products and services represents your
                                    agreement with the then-current statement.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Rights of the Data Subject
                                </Label>
                                <CardDescription>
                                    RA 10173 Data Privacy Act of 2012
                                </CardDescription>

                                <div className="space-y-2">
                                    {rights.map((item, index) => (
                                        <Item
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                        >
                                            <ItemMedia>
                                                <ShieldCheck className="h-4 w-4 text-blue-500" />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemDescription>
                                                    {item}
                                                </ItemDescription>
                                            </ItemContent>
                                        </Item>
                                    ))}
                                </div>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    If you would like to exercise any of the
                                    above rights, please contact our support
                                    team or our Data Protection Officer. We will
                                    consider your request in accordance with
                                    applicable laws. To protect your privacy and
                                    security, we may take steps to verify your
                                    identity before complying with the request.
                                </p>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    You also have the right to complain to a
                                    data protection authority about our
                                    collection and use of your personal data.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    How to File a Complaint
                                </Label>

                                <p className="text-justify text-sm leading-6 text-muted-foreground sm:leading-7">
                                    If there is a complaint regarding the
                                    processing of personal data, please contact
                                    the Data Protection Officer listed below. It
                                    is the right of the data subject to lodge a
                                    complaint with Wireless Access for Health to
                                    protect personal information.
                                </p>

                                <p className="text-sm leading-6 text-muted-foreground sm:leading-7">
                                    If you have any questions regarding Wireless
                                    Access for Health, please send an email to:{' '}
                                    <span className="font-medium break-all text-foreground">
                                        wah.pilipinas@wah.ph
                                    </span>
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <Label className="text-base font-semibold">
                                    Data Protection Officer Contact Details
                                </Label>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {dataProtectionOfficerDetails.map(
                                        (item) => (
                                            <Item
                                                key={item.label}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                            >
                                                <ItemMedia>
                                                    <User className="h-4 w-4" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>
                                                        {item.label}
                                                    </ItemTitle>
                                                    <ItemDescription className="wrap-break-word">
                                                        {item.value}
                                                    </ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex justify-center p-4 sm:p-6">
                                <img
                                    src="/images/corseal.png"
                                    alt="COR Seal"
                                    className="h-auto w-full max-w-55 object-contain sm:max-w-70"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DataPrivacyModal;
