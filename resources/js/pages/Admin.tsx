import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { User } from "@/types/auth";
import { ShieldUser , ShieldPlus, Trash2, Edit2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MoreHorizontal } from "lucide-react";
import { Head, usePage } from "@inertiajs/react";
import NotFound from "./NotFound";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import { Empty, EmptyDescription, EmptyHeader } from '../../js/components/ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../lottie/NoResult.json';

// Import Modal Components
import RevokeAccessModal from "@/components/AdminPopUps/RevokeAccessModal";
import ApproveUserModal from "@/components/AdminPopUps/ApproveUserModal";
import RejectUserModal from "@/components/AdminPopUps/RejectUserModal";
import ChangeRoleModal from "@/components/AdminPopUps/ChangeRoleModal";
import RequestsModal from "@/components/AdminPopUps/RequestsModal";
import DeleteFacilitatorModal from "@/components/AdminPopUps/DeleteFacilitatorModal";
import AddEditFacilitatorModal from "@/components/AdminPopUps/AddEditFacilitatorModal";

const roles = ["Staff", "Admin"];

type Facilitator = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  userList: User[];
};

const Admin: React.FC<Props> = ({ userList }) => {
  const [userListState, setUserListState] = useState<User[]>(userList);
  
  // USER ROLE MANAGEMENT STATES
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string>("");
  const [isUserRoleLoading, setIsUserRoleLoading] = useState(false);

  // USER APPROVAL/REJECTION STATES
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<User | null>(null);
  const [selectedUserForRejection, setSelectedUserForRejection] = useState<User | null>(null);
  const [approvalRejectionLoading, setApprovalRejectionLoading] = useState<number | null>(null);

  // USER REVOKE ACCESS STATES
  const [selectedUserForRevoke, setSelectedUserForRevoke] = useState<User | null>(null);
  const [isRevokeLoading, setIsRevokeLoading] = useState(false);

  // FACILITATOR STATES
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [isFacilitatorFormModalOpen, setIsFacilitatorFormModalOpen] = useState(false);
  const [facilitatorFormName, setFacilitatorFormName] = useState("");
  const [editingFacilitator, setEditingFacilitator] = useState<Facilitator | null>(null);
  const [isFacilitatorActionLoading, setIsFacilitatorActionLoading] = useState(false);
  const [selectedFacilitatorForDelete, setSelectedFacilitatorForDelete] = useState<Facilitator | null>(null);
  const [isFacilitatorDeleteModalOpen, setIsFacilitatorDeleteModalOpen] = useState(false);

  // FETCH FUNCTIONS
  const fetchRequests = async () => {
    try {
      const response = await axios.get("/admin/get-requests");
      setPendingRequests(response.data.requests);
    } catch (error) {
      toast.error("Error fetching registration requests.");
      console.error("Error fetching requests:", error);
    }
  };

  const fetchUserList = async () => {
    try {
      const response = await axios.get("/admin/get-user-list");
      setUserListState(response.data.userList);
    } catch (error) {
      toast.error("Error fetching user list.");
      console.error("Error fetching user list:", error);
    }
  };

  const fetchFacilitators = async () => {
    try {
      const response = await axios.get("/facilitators");
      setFacilitators(response.data.facilitators);
    } catch (error) {
      toast.error("Error fetching facilitators.");
      console.error("Error fetching facilitators:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUserList();
    fetchFacilitators();
  }, []);

  // USER ROLE CHANGE HANDLER
  const handleUserRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    setIsUserRoleLoading(true);
    try {
      await axios.post(
        `/admin/set-role/${selectedUserForRole.id}/${selectedUserRole}`
      );
      fetchUserList();
      toast.success(
        `Changed role for ${selectedUserForRole.name} to ${selectedUserRole}`
      );
      setIsUserRoleModalOpen(false);
      setSelectedUserForRole(null);
      setSelectedUserRole("");
    } catch (error) {
      toast.error(`Failed to change role for ${selectedUserForRole.name}`);
      console.error("Error changing role:", error);
    } finally {
      setIsUserRoleLoading(false);
    }
  };

  // APPROVE USER HANDLER
  const handleApproveUser = async (user: User) => {
    setApprovalRejectionLoading(user.id);
    try {
      await axios.post(`/admin/set-status/${user.id}/approved`);
      toast.success(`User ${user.name} approved`);
      setSelectedUserForApproval(null);
      fetchRequests();
      fetchUserList();
    } catch (error: any) {
      toast.error(`Failed to approve user ${user.name}`);
      console.error("Error approving user:", error);
    } finally {
      setApprovalRejectionLoading(null);
    }
  };

  // REJECT USER HANDLER
  const handleRejectUser = async (user: User) => {
    setApprovalRejectionLoading(user.id);
    try {
      await axios.post(`/admin/set-status/${user.id}/Rejected`);
      toast.success(`User ${user.name} rejected`);
      setSelectedUserForRejection(null);
      fetchRequests();
      fetchUserList();
    } catch (error: any) {
      toast.error(`Failed to reject user ${user.name}`);
      console.error("Error rejecting user:", error);
    } finally {
      setApprovalRejectionLoading(null);
    }
  };

  // REVOKE ACCESS HANDLER
  const handleRevokeAccess = async () => {
    if (!selectedUserForRevoke) return;
    setIsRevokeLoading(true);
    try {
      await axios.post(`/admin/revoke-access/${selectedUserForRevoke.id}`);
      await fetchUserList();
      await fetchRequests();
      toast.success(`Access revoked for ${selectedUserForRevoke.name}`);
      setSelectedUserForRevoke(null);
    } catch (error) {
      toast.error(`Failed to revoke access`);
      console.error("Error revoking access:", error);
    } finally {
      setIsRevokeLoading(false);
    }
  };

  // FACILITATOR HANDLERS
  const handleSaveFacilitator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilitatorFormName.trim()) {
      toast.error("Please enter a facilitator name.");
      return;
    }

    setIsFacilitatorActionLoading(true);
    try {
      if (editingFacilitator) {
        await axios.put(`/facilitators/${editingFacilitator.id}`, {
          name: facilitatorFormName,
        });
        toast.success(`Facilitator ${facilitatorFormName} updated successfully.`);
      } else {
        await axios.post("/facilitators", {
          name: facilitatorFormName,
        });
        toast.success(`Facilitator ${facilitatorFormName} added successfully.`);
      }

      fetchFacilitators();
      closeFacilitatorFormModal();
    } catch (error: any) {
      toast.error(
        editingFacilitator
          ? "Failed to update facilitator."
          : "Failed to add facilitator."
      );
      console.error("Error saving facilitator:", error);
    } finally {
      setIsFacilitatorActionLoading(false);
    }
  };

  const handleDeleteFacilitator = async () => {
    if (!selectedFacilitatorForDelete) return;

    setIsFacilitatorActionLoading(true);
    try {
      await axios.delete(
        `/facilitators/${selectedFacilitatorForDelete.id}`
      );
      toast.success(
        `Facilitator ${selectedFacilitatorForDelete.name} deleted successfully.`
      );
      fetchFacilitators();
      setIsFacilitatorDeleteModalOpen(false);
      setSelectedFacilitatorForDelete(null);
    } catch (error) {
      toast.error("Failed to delete facilitator.");
      console.error("Error deleting facilitator:", error);
    } finally {
      setIsFacilitatorActionLoading(false);
    }
  };

  const handleEditFacilitator = (facilitator: Facilitator) => {
    setEditingFacilitator(facilitator);
    setFacilitatorFormName(facilitator.name);
    setIsFacilitatorFormModalOpen(true);
  };

  const closeFacilitatorFormModal = () => {
    setIsFacilitatorFormModalOpen(false);
    setFacilitatorFormName("");
    setEditingFacilitator(null);
  };

  const { auth } = usePage().props as any;
  const role = auth?.user?.role;
  if (role !== "Admin") {
    return <NotFound status={404} />;
  }

  return (
    <AppLayout>
      <Head>
        <title>Admin Dashboard</title>
      </Head>

      {/* MODAL COMPONENTS */}
      <RevokeAccessModal
        isOpen={!!selectedUserForRevoke}
        onOpenChange={() => setSelectedUserForRevoke(null)}
        user={selectedUserForRevoke}
        isLoading={isRevokeLoading}
        onConfirm={handleRevokeAccess}
      />

      <ApproveUserModal
        isOpen={!!selectedUserForApproval}
        onOpenChange={() => setSelectedUserForApproval(null)}
        user={selectedUserForApproval}
        isLoading={approvalRejectionLoading === selectedUserForApproval?.id}
        onConfirm={() =>
          selectedUserForApproval && handleApproveUser(selectedUserForApproval)
        }
      />

      <RejectUserModal
        isOpen={!!selectedUserForRejection}
        onOpenChange={() => setSelectedUserForRejection(null)}
        user={selectedUserForRejection}
        isLoading={approvalRejectionLoading === selectedUserForRejection?.id}
        onConfirm={() =>
          selectedUserForRejection && handleRejectUser(selectedUserForRejection)
        }
      />

      <ChangeRoleModal
        isOpen={isUserRoleModalOpen}
        onOpenChange={setIsUserRoleModalOpen}
        user={selectedUserForRole}
        selectedRole={selectedUserRole}
        onRoleChange={(e) => setSelectedUserRole(e.target.value)}
        roles={roles}
        isLoading={isUserRoleLoading}
        onConfirm={handleUserRoleChange}
      />

      <RequestsModal
        isOpen={isRequestsModalOpen}
        onOpenChange={setIsRequestsModalOpen}
        requests={pendingRequests}
        onApprove={(user) => setSelectedUserForApproval(user)}
        onReject={(user) => setSelectedUserForRejection(user)}
        isLoading={!!approvalRejectionLoading}
      />

      <DeleteFacilitatorModal
        isOpen={isFacilitatorDeleteModalOpen}
        onOpenChange={setIsFacilitatorDeleteModalOpen}
        facilitator={selectedFacilitatorForDelete}
        isLoading={isFacilitatorActionLoading}
        onConfirm={handleDeleteFacilitator}
      />

      <AddEditFacilitatorModal
        isOpen={isFacilitatorFormModalOpen}
        onOpenChange={closeFacilitatorFormModal}
        facilitatorName={facilitatorFormName}
        onNameChange={setFacilitatorFormName}
        isEditing={!!editingFacilitator}
        isLoading={isFacilitatorActionLoading}
        onSubmit={handleSaveFacilitator}
      />

      <div className="p-8 space-y-8">
        {/* USERS SECTION */}
        <CardHeader className="space-y-1">
          <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ShieldPlus className="h-6 w-6 text-primary flex-shrink-0" />
                <Label className="text-2xl font-black md:text-3xl truncate">
                  Admin Dashboard
                </Label>
              </div>
              <CardDescription className="mt-1">
                Manage your users and their roles.
              </CardDescription>
            </div>
            <div className="relative inline-block">
              <Button
                onClick={() => setIsRequestsModalOpen(!isRequestsModalOpen)}
                className="w-full md:w-auto"
              >
                Requests
              </Button>
              {pendingRequests.length > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs font-bold px-2 py-0.5 min-w-[1.5em] text-center pointer-events-none"
                  style={{ lineHeight: 1 }}
                >
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <Card className="w-full overflow-hidden">
          <CardContent>
            <div className="max-h-[70vh] overflow-auto px-5">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                {userListState.length > 0 ? (
                  <TableBody>
                    {userListState.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="pr-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                disabled={isUserRoleLoading}
                                onClick={() => {
                                  setSelectedUserForRole(user);
                                  setSelectedUserRole(user.role as string);
                                  setIsUserRoleModalOpen(true);
                                }}
                              >
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                disabled={isUserRoleLoading}
                                onClick={() => setSelectedUserForRevoke(user)}
                              >
                                Revoke Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : null}
              </Table>

              {userListState.length === 0 && (
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
          </CardContent>
        </Card>

        {/* FACILITATORS SECTION */}
        <CardHeader className="space-y-1">
          <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ShieldUser className="h-6 w-6 text-primary flex-shrink-0" />
                <Label className="text-2xl font-black md:text-3xl truncate">
                  Facilitators
                </Label>
              </div>
              <CardDescription className="mt-1">
                Manage event facilitators.
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingFacilitator(null);
                setFacilitatorFormName("");
                setIsFacilitatorFormModalOpen(true);
              }}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Facilitator
            </Button>
          </div>
        </CardHeader>

        <Card className="w-full overflow-hidden">
          <CardContent>
            <div className="max-h-[70vh] overflow-auto px-5">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                {facilitators.length > 0 ? (
                  <TableBody>
                    {facilitators.map((facilitator) => (
                      <TableRow key={facilitator.id}>
                        <TableCell>{facilitator.id}</TableCell>
                        <TableCell>{facilitator.name}</TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            disabled={isFacilitatorActionLoading}
                            onClick={() =>
                              handleEditFacilitator(facilitator)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={isFacilitatorActionLoading}
                            onClick={() => {
                              setSelectedFacilitatorForDelete(facilitator);
                              setIsFacilitatorDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : null}
              </Table>

              {facilitators.length === 0 && (
                <Empty className="py-12 w-full">
                  <Lottie
                    loop
                    className="h-auto w-40"
                    animationData={errorAnimation}
                  />
                  <EmptyHeader>
                    <EmptyDescription>
                      No facilitators found. Create one to get started.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Admin;