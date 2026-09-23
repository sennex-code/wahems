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
import { User } from "@/types/auth";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  selectedRole: string;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  roles: string[];
  isLoading: boolean;
  onConfirm: (e: React.FormEvent) => void;
};

const ChangeRoleModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  user,
  selectedRole,
  onRoleChange,
  roles,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Change Role for <span className="font-semibold">{user?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onConfirm}>
          <Label htmlFor="role" className="mb-2 block">
            Role
          </Label>
          <select
            id="role"
            value={selectedRole}
            onChange={onRoleChange}
            className="
              w-full mb-4 p-2 rounded border
              bg-[var(--color-background)]
              text-[var(--color-foreground)]
              dark:bg-[var(--color-background)]
              dark:text-[var(--color-foreground)]
              focus:ring focus:ring-primary-500
              transition-all
            "
            style={{
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              borderColor: "var(--color-border)",
            }}
            required
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((roleOption) => (
              <option
                key={roleOption}
                value={roleOption}
                style={{
                  background: "var(--color-background)",
                }}
              >
                {roleOption}
              </option>
            ))}
          </select>
          <DialogFooter className="flex gap-2">
            <Button type="submit" variant="default" disabled={isLoading}>
              Save
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;