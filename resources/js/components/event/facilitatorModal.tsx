import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent } from '../ui/card';
import { MiniBadge } from '../reusable/mini-badge';
import wavingJuWAHN from '../../../../public/images/WavingJuWAHN.png';

type Facilitator = {
    id: number;
    name: string;
    survey_id?: number | null;
};

type FacilitatorsModalProps = {
    facilitators: Facilitator[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

const FacilitatorsModal = ({
    facilitators,
    open,
    setOpen,
}: FacilitatorsModalProps) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="sm:max-w-lg p-10 overflow-hidden">
        <h1 className="relative z-10 font-black text-lg">Event Facilitators</h1>

        <img
            src={wavingJuWAHN}
            alt=""
            className="absolute z-0 w-50 bottom-[-40px] right-90 pointer-events-none select-none"
        />

        <Card className="relative z-10 border-0 bg-muted backdrop-blur-md shadow-lg">
            <CardContent className="pt-6 flex flex-col items-start gap-6">
                {facilitators.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {facilitators.map((facilitator, index) => (
                            <MiniBadge key={facilitator.id ?? index}>
                                <p className='text-lg'>   {facilitator.name}</p>
                              
                            </MiniBadge>
                        ))}
                        
                    </div>
                ) : (
                    <p>No facilitators assigned.</p>
                )}
            </CardContent>
        </Card>

        <DialogFooter className="relative z-10">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>
    );
};

export default FacilitatorsModal;