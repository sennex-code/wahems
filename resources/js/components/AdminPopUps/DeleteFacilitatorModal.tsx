import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Facilitator = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facilitator: Facilitator | null;
  isLoading: boolean;
  onConfirm: () => void;
};

const DeleteFacilitatorModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  facilitator,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Facilitator</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{facilitator?.name}</span>?
            <br />
            <span className="text-red-500 font-semibold">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFacilitatorModal;