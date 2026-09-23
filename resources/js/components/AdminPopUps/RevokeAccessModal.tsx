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
import { User } from "@/types/auth";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isLoading: boolean;
  onConfirm: () => void;
};

const RevokeAccessModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  user,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Access</DialogTitle>
          <DialogDescription>
            Are you <b>sure</b> you want to revoke system access for{" "}
            <span className="font-semibold">{user?.name}</span> (
            {user?.email})? <br />
            This user will not be able to sign in until re-approved.
            <br />
            <span className="text-red-500 font-semibold">
              This action cannot be easily undone.
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
            {isLoading ? "Revoking..." : "Confirm Revoke"}
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

export default RevokeAccessModal;