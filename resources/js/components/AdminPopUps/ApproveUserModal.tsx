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

const ApproveUserModal: React.FC<Props> = ({
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
          <DialogTitle>Approve Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to <b>approve</b> the account request for{" "}
            <span className="font-semibold">{user?.name}</span> (
            {user?.email})?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="default"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Approving..." : "Confirm Approve"}
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

export default ApproveUserModal;