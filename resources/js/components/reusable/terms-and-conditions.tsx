import { Dispatch, memo, SetStateAction } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import { BookImage, CheckIcon, Globe, Video } from 'lucide-react';

import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
type TermsAndConditionsType = {
    isTermsShown: boolean;
    toggleTerms: Dispatch<SetStateAction<boolean>>;
};

const TermsAndConditions = ({
    isTermsShown,
    toggleTerms,
}: TermsAndConditionsType) => {
    const rights = [
        'Request access to the images and/or videos in which you appear',
        'Withdraw your consent at any time by contacting us at Mobile: Globe +63917 529 7095 / Smart +63998 565 1432. Upon withdrawal, Wireless Access for Health will cease any future use of your photos/videos, but may continue to use materials already published',
        'Request the removal of any images or videos from the Wireless Access for Health  website or social media accounts',
    ];
    return (
        <Dialog open={isTermsShown} onOpenChange={toggleTerms}>
            <DialogContent
                forceMount
                className="flex h-[90vh] min-w-[50%] flex-col overflow-hidden rounded-2xl border p-0 shadow-2xl"
            >
                <DialogHeader className="border-b px-6 py-5">
                    <Label className="mx-auto text-lg leading-snug font-bold md:text-xl">
                        WIRELESS ACCESS FOR HEALTH PHOTOGRAPHY AND VIDEO CONSENT
                        NOTICE
                    </Label>
                    <DialogDescription className="mt-3 text-sm leading-6">
                        I authorize that I may be photographed, videotaped,
                        and/or filmed, and I permit any subsequent use of the
                        resulting images and recordings by Wireless Access for
                        Health for promotional purposes. This includes, but is
                        not limited to, use on social media platforms, the
                        Wireless Access for Health website, presentations,
                        videos, displays, posters, marketing materials, and
                        other official publications.
                    </DialogDescription>
                </DialogHeader>

                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
                    <div className="mx-auto flex max-w-2xl flex-col gap-6">
                        <Card className="rounded-xl border p-5">
                            <div>
                                <Label className="text-base font-semibold">
                                    Types of Use
                                </Label>
                                <p className="mt-2 text-sm leading-6">
                                    The images and/or videos may be used in the
                                    following ways:
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <Item
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl px-4 py-3 shadow-sm transition"
                                >
                                    <ItemMedia variant="icon">
                                        {/* <Facebook className="h-5 w-5 text-blue-600" /> */}
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm leading-6 font-medium">
                                            Social media platforms (e.g.,
                                            Facebook, Instagram, Twitter,
                                            LinkedIn)
                                        </ItemTitle>
                                    </ItemContent>
                                </Item>

                                <Item
                                    variant="outline"
                                    size="sm"
                                    className="x-4 rounded-xl py-3"
                                >
                                    <ItemMedia variant="icon">
                                        <Globe className="h-5 w-5 text-emerald-600" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm leading-6 font-medium">
                                            Websites and promotional printed or
                                            digital materials
                                        </ItemTitle>
                                    </ItemContent>
                                </Item>

                                <Item
                                    variant="outline"
                                    size="sm"
                                    className="e rounded-xl px-4 py-3"
                                >
                                    <ItemMedia variant="icon">
                                        <BookImage className="h-5 w-5 text-violet-600" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm leading-6 font-medium">
                                            Printed marketing materials (e.g.,
                                            brochures, posters)
                                        </ItemTitle>
                                    </ItemContent>
                                </Item>

                                <Item
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl px-4 py-3"
                                >
                                    <ItemMedia variant="icon">
                                        <Video className="h-5 w-5 text-rose-600" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm leading-6 font-medium">
                                            Presentations and promotional videos
                                        </ItemTitle>
                                    </ItemContent>
                                </Item>
                            </div>
                        </Card>

                        <Card className="rounded-xl border p-5 shadow-sm">
                            <CardContent>
                                <Label className="text-base font-semibold">
                                    Data Storage and Retention
                                </Label>
                                <p className="mt-2 text-justify text-sm">
                                    Wireless Access for Health will store the
                                    photos/videos securely and retain them for
                                    as long as necessary to fulfill the purposes
                                    mentioned above. The images will not be
                                    shared with unauthorized third parties or
                                    used for any purpose other than those stated
                                    in this consent form.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border">
                            <CardContent>
                                <Label className="0 text-base font-semibold">
                                    Your Rights
                                </Label>

                                <div className="mt-4 flex flex-col gap-3">
                                    {rights.map((item) => (
                                        <Item
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl px-4 py-3"
                                        >
                                            <ItemMedia variant="icon">
                                                <CheckIcon className="h-5 w-5 text-green-600" />
                                            </ItemMedia>
                                            <ItemContent>
                                                <ItemDescription className="text-sm">
                                                    {item}
                                                </ItemDescription>
                                            </ItemContent>
                                        </Item>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border p-5 shadow-sm">
                            <CardContent>
                                <Label className="text-base font-semibold">
                                    Consent
                                </Label>
                                <p className="mt-2 text-justify text-sm">
                                    I voluntarily agree to allow Wireless Access
                                    for Health to capture and use my image for
                                    the purposes stated above. I understand that
                                    my participation is voluntary and that I
                                    will not receive any compensation for the
                                    use of the images/videos.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default memo(TermsAndConditions);
