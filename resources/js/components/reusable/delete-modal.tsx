import { router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import toast from 'react-hot-toast';
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
    isDeleteShown: boolean;
    toggleDeleteModal: () => void;
    onAction: () => void;
};

export function DeleteConfirmation({
    isDeleteShown,
    toggleDeleteModal,
    onAction,
}: DeleteEventType) {
    return (
        <AlertDialog open={isDeleteShown} onOpenChange={toggleDeleteModal}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                    <AlertDialogDescription className="text-justify">
                        You are about to permanently delete this record Please
                        note that this action is irreversible and may remove
                        related data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onAction}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
