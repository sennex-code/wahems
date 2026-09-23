import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Facilitator = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facilitatorName: string;
  onNameChange: (value: string) => void;
  isEditing: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

const AddEditFacilitatorModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  facilitatorName,
  onNameChange,
  isEditing,
  isLoading,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Facilitator" : "Add New Facilitator"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Label htmlFor="facilitator-name" className="mb-2 block">
            Facilitator Name
          </Label>
          <Input
            id="facilitator-name"
            type="text"
            placeholder="Enter facilitator name"
            value={facilitatorName}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={isLoading}
            required
            className="mb-4"
          />
          <DialogFooter className="flex gap-2">
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
            >
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update"
                : "Add"}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditFacilitatorModal;