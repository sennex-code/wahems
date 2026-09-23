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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import Lottie from "lottie-react";
import errorAnimation from "../../../lottie/NoResult.json";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requests: User[];
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  isLoading: boolean;
};

const RequestsModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  requests,
  onApprove,
  onReject,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw]">
        <DialogHeader>
          <DialogTitle>Account Registration Requests</DialogTitle>
          <DialogDescription>
            Review and manage pending registration requests.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          {requests.length > 0 ? (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="pr-4 text-right ">
                      <Button
                        variant={"outline"}
                        className="mr-1"
                        disabled={isLoading}
                        onClick={() => onApprove(user)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant={"destructive"}
                        disabled={isLoading}
                        onClick={() => onReject(user)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="py-12 w-full">
              <Lottie
                loop
                className="h-auto w-40"
                animationData={errorAnimation}
              />
              <EmptyHeader>
                <EmptyDescription>
                  No results have been found.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestsModal;