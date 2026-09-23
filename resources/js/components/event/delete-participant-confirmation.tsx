import { router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeleteEventType = {
    participantId: number;
    isDeleteShown: boolean;
    toggleDeleteModal: Dispatch<SetStateAction<boolean>>;
};

export function DeleteParticipantConfirmation({
    participantId,
    isDeleteShown,
    toggleDeleteModal,
}: DeleteEventType) {
    const handleDelete = () => {
        router.delete(
            route('event-participant.destroy', {
                eventParticipantId: Number(participantId),
            }),
            {
                onSuccess: () => {
                    toast.success('Participant Deleted!');
                    toggleDeleteModal(false);
                },
            },
        );
    };

    return (
        <AlertDialog open={isDeleteShown} onOpenChange={toggleDeleteModal}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete Participant?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be{' '}
                        <span className="font-extrabold text-red-500">
                            undo
                        </span>{' '}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete()}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
