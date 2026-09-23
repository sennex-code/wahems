import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '../ui/card';
type ViewMoreModalType = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participantInfo: any;
    viewMoreModal: boolean;
    toggleViewMoreModal: Dispatch<SetStateAction<boolean>>;
};
export function ViewMoreModal({
    participantInfo,
    viewMoreModal,
    toggleViewMoreModal,
}: ViewMoreModalType) {
    return (
        <Dialog open={viewMoreModal} onOpenChange={toggleViewMoreModal}>
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>
                        {' '}
                        {participantInfo.participant.last_name},{' '}
                        {participantInfo.participant.first_name}{' '}
                        {participantInfo.participant.middle_initial}
                    </DialogTitle>
                </DialogHeader>

                <Label htmlFor="name-1">Email</Label>
                <Input
                    disabled
                    id="name-1"
                    name="name"
                    defaultValue={`${participantInfo.participant.email}`}
                />

                <Label htmlFor="name-1">Mobile Number</Label>
                <Input
                    disabled
                    id="name-1"
                    name="name"
                    defaultValue={`${participantInfo.participant.mobile_number}`}
                />

                <Card>
                    <Label className="ml-2">Attendance</Label>
                    {participantInfo.attendances.map(
                        (item: any, index: number) => {
                            return (
                                <div className="flex flex-row">
                                    <p>Day{index + 1}</p>
                                </div>
                            );
                        },
                    )}
                </Card>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export default ViewMoreModal;
