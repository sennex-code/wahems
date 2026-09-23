import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const ConfirmationModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  message = "Are you sure you want to delete this?"
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-[340px] rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>Confirm</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p>{message}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationModal;