import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import {
    Pencil,
    Trash,
    Building2,
    MapPin,
    Plus,
    ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { usePSGC } from '@/hooks/queries/usePSGC';
import { TablePagination } from '@/components/reusable/table-pagination';
import { Label } from '@/components/ui/label';

import { FacilityDialog } from '../components/reusable/FacilityDialog';

const isWahCodeValid = (code: any) => {
    return /^WAH\d{15}$/.test(code);
};

const MiniBadge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        {children}
    </span>
);

const Facility = ({ facilities }: any) => {
    const [region, setRegion] = React.useState<string>('');
    const [province, setProvince] = React.useState<string>('');
    const [municipality, setMunicipality] = React.useState<string>('');
    const [barangay, setBarangay] = React.useState<string>('');

    const { regions, provinces, municipalities, barangays } = usePSGC({
        region: region,
        province: province,
        municipality: municipality,
        barangay: barangay,
    });

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        id: null as number | null,
        facility_name: '',
        wah_code: '',
        short_code: '',
        region_code: '',
        province_code: '',
        municipality_code: '',
        barangay_code: '',
    });

    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    // Delete confirmation modal state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // For uniqueness checks
    const allFacilityCodes = React.useMemo(
        () => (facilities?.data ?? []).map((f: any) => f.code).filter(Boolean),
        [facilities]
    );

    const handleEdit = (facility: any) => {
        setRegion(facility.region_code);
        setProvince(facility.province_code);
        setMunicipality(facility.municipality_code);
        setBarangay(facility.barangay_code);

        setData({
            id: facility.id,
            facility_name: facility.facility_name,
            wah_code: facility.code,
            short_code: facility.short_code,
            region_code: facility.region_code,
            province_code: facility.province_code,
            municipality_code: facility.municipality_code,
            barangay_code: facility.barangay_code,
        });

        setOpenEdit(true);
    };

    function submitForm(e: React.FormEvent) {
        e.preventDefault();

        if (!isWahCodeValid(data.wah_code)) {
            toast.error(
                "Invalid WAH Code. Must start with 'WAH' followed by 15 digits.",
            );
            return;
        }

        // Uniqueness check for CREATE
        if (allFacilityCodes.includes(data.wah_code)) {
            toast.error("WAH Code already exists in another facility.");
            return;
        }

        post('/create-facility', {
            onSuccess: () => {
                toast.success('Facility created successfully!');
                reset();
                setRegion('');
                setProvince('');
                setMunicipality('');
                setBarangay('');
                setOpen(false);
            },
            onError: (err) => {
                // Show all validation errors if possible
                if (err && typeof err === 'object') {
                    Object.values(err).forEach((msg: string | string[]) => {
                        if (Array.isArray(msg)) msg.forEach(m => toast.error(m));
                        else toast.error(msg as string);
                    });
                } else {
                    toast.error('Please fix the errors in the form.');
                }
            }
        });
    }

    function updateForm(e: React.FormEvent) {
        e.preventDefault();

        if (!isWahCodeValid(data.wah_code)) {
            toast.error(
                "Invalid WAH Code. Must start with 'WAH' followed by 15 digits.",
            );
            return;
        }

        // Uniqueness check for EDIT (ignore current facility)
        const duplicate = (facilities?.data ?? []).some(
            (f: any) => f.code === data.wah_code && f.id !== data.id
        );
        if (duplicate) {
            toast.error("WAH Code already exists in another facility.");
            return;
        }

        patch(`/update-facility/${data.id}`, {
            onSuccess: () => {
                toast.success('Facility updated successfully!');
                reset();
                setRegion('');
                setProvince('');
                setMunicipality('');
                setBarangay('');
                setOpenEdit(false);
            },
            onError: (err) => {
                // Check if the backend returns wah_code, short_code, delete (custom) or other errors
                if (err && typeof err === 'object') {
                    if (err.wah_code)
                        return toast.error(err.wah_code);
                    if (err.short_code)
                        return toast.error(err.short_code);
                    if (err.delete)
                        return toast.error(err.delete);
                    if (Object.values(err).length > 0) {
                        Object.values(err).forEach((msg: string | string[]) => {
                            if (Array.isArray(msg)) msg.forEach(m => toast.error(m));
                            else toast.error(msg as string);
                        });
                        return;
                    }
                }
                toast.error('Failed to update facility.');
            }
        });
    }

    // MODAL for delete confirmation
    const handleModalDelete = () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        router.delete(`/delete-facility/${deleteId}`, {
            onError: (errors) => {
                setDeleteLoading(false);
                setDeleteId(null);
                if (errors && typeof errors === 'object' && errors.delete)
                    toast.error(errors.delete);
                else
                    toast.error('An unexpected error occurred.');
            },
            onSuccess: () => {
                setDeleteLoading(false);
                setDeleteId(null);
                toast.success('Facility deleted successfully!');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Facility Management" />
            <div className="flex flex-col gap-6 p-6 md:p-12">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <Label className="text-2xl font-black md:text-3xl">
                                Facility Management
                            </Label>
                        </div>
                        <CardDescription>
                            Manage private facilities and their PSGC address
                            details.
                        </CardDescription>
                    </CardHeader>

                    <Button
                        onClick={() => setOpen(true)}
                        size="lg"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Facility
                    </Button>
                </div>

                {/* CREATE FACILITY DIALOG */}
                <FacilityDialog
                    open={open}
                    onOpenChange={setOpen}
                    title="Add Private Facility"
                    description="Add a private facility to the database."
                    icon={<Plus className="h-4 w-4 text-primary" />}
                    processing={processing}
                    isEdit={false}
                    errors={errors}
                    data={data}
                    setData={setData}
                    onCancel={() => setOpen(false)}
                    onSubmit={submitForm}
                    submitLabel="Submit"
                    regions={regions?.data ? { data: regions.data } : { data: [] }}
                    provinces={provinces?.data ? { data: provinces.data } : { data: [] }}
                    municipalities={municipalities?.data ? { data: municipalities.data } : { data: [] }}
                    barangays={barangays?.data ? { data: barangays.data } : { data: [] }}
                    setRegion={setRegion}
                    setProvince={setProvince}
                    setMunicipality={setMunicipality}
                    setBarangay={setBarangay}
                />

                {/* EDIT FACILITY DIALOG */}
                <FacilityDialog
                    open={openEdit}
                    onOpenChange={setOpenEdit}
                    title="Edit Private Facility"
                    description="Update facility details."
                    icon={<Pencil className="h-4 w-4 text-primary" />}
                    processing={processing}
                    isEdit={true}
                    errors={errors}
                    data={data}
                    setData={setData}
                    onCancel={() => setOpenEdit(false)}
                    onSubmit={updateForm}
                    submitLabel="Update Facility"
                    regions={regions?.data ? { data: regions.data } : { data: [] }}
                    provinces={provinces?.data ? { data: provinces.data } : { data: [] }}
                    municipalities={municipalities?.data ? { data: municipalities.data } : { data: [] }}
                    barangays={barangays?.data ? { data: barangays.data } : { data: [] }}
                    setRegion={setRegion}
                    setProvince={setProvince}
                    setMunicipality={setMunicipality}
                    setBarangay={setBarangay}
                />

                {/* DELETE CONFIRMATION MODAL */}
                <Dialog open={deleteId !== null} onOpenChange={v => { if (!v) setDeleteId(null); }}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>
                                <Trash className="inline-block mr-2 text-destructive" />
                                Delete Facility
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this facility? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="outline"
                                disabled={deleteLoading}
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={deleteLoading}
                                onClick={handleModalDelete}
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Table Card */}
                <Card className="w-full overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="text-base">
                                    Facilities
                                </CardTitle>
                                <CardDescription>
                                    Review and manage saved facilities.
                                </CardDescription>
                            </div>
                            <MiniBadge>
                                {facilities?.data?.length ?? 0} shown
                            </MiniBadge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="max-h-[70vh] overflow-auto px-5">
                            <Table className="w-full">
                                <TableHeader className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Facility</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Short Code</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead>Province</TableHead>
                                        <TableHead>Municipality</TableHead>
                                        <TableHead>Barangay</TableHead>
                                        <TableHead className="pr-4 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {facilities?.data?.map((facility: any) => (
                                        <TableRow
                                            key={facility.id}
                                            className="transition-colors hover:bg-accent/40"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-start gap-2">
                                                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                    <div className="min-w-0">
                                                        <div className="truncate">
                                                            {
                                                                facility.facility_name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            ID: {facility.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {facility.code}
                                            </TableCell>

                                            <TableCell className="font-mono text-xs">
                                                <MiniBadge>
                                                    {facility.short_code}
                                                </MiniBadge>
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground">
                                                {facility.region?.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {facility.province?.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {facility.municipality?.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {facility.barangay?.name}
                                            </TableCell>

                                            <TableCell className="pr-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            handleEdit(
                                                                facility,
                                                            )
                                                        }
                                                        variant="outline"
                                                        size="icon"
                                                        className="rounded-full"
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="rounded-full"
                                                        onClick={() => setDeleteId(facility.id)}
                                                        aria-label="Delete"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {(!facilities?.data ||
                                        facilities.data.length === 0) && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-16"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="text-sm text-muted-foreground">
                                                        No facilities found.
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-4">
                    <TablePagination links={facilities.links} />
                </div>
            </div>
        </AppLayout>
    );
};

export default Facility;