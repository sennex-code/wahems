import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, MapPin } from 'lucide-react';
import React from 'react';

type SelectOption = {
    psgc_10_digit_code: string;
    name: string;
};

interface FacilityDialogProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    processing: boolean;
    title: React.ReactNode;
    description: string;
    icon?: React.ReactNode;
    isEdit?: boolean;
    data: any;
    setData: (key: string, value: string) => void;
    errors?: Record<string, string>;
    regions?: { data: SelectOption[] };
    provinces?: { data: SelectOption[] };
    municipalities?: { data: SelectOption[] };
    barangays?: { data: SelectOption[] };
    setRegion: (region: string) => void;
    setProvince: (province: string) => void;
    setMunicipality: (municipality: string) => void;
    setBarangay: (barangay: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    submitLabel?: string;
}

export function FacilityDialog({
    open,
    onOpenChange,
    processing,
    title,
    description,
    icon,
    data,
    setData,
    errors = {},
    regions,
    provinces,
    municipalities,
    barangays,
    setRegion,
    setProvince,
    setMunicipality,
    setBarangay,
    onSubmit,
    onCancel,
    submitLabel = 'Submit',
}: FacilityDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
                <div className="flex max-h-[85vh] flex-col pb-10">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            {icon}
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                        <form onSubmit={onSubmit} className="flex flex-col gap-5">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Facility Details
                                    </CardTitle>
                                    <CardDescription>
                                        Basic facility identifiers.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            Facility Name
                                        </label>
                                        <Input
                                            required
                                            type="text"
                                            name="facility_name"
                                            id="facility_name"
                                            placeholder="Facility Name"
                                            value={data.facility_name}
                                            onChange={(e) =>
                                                setData('facility_name', e.target.value)
                                            }
                                        />
                                        {errors.facility_name && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.facility_name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                            18 Digit DOH/WAH Code
                                        </label>
                                        <Input
                                            required
                                            id="wah_code"
                                            name="wah_code"
                                            type="text"
                                            maxLength={18}
                                            placeholder="WAHxxxxxxxxxxxxxxx"
                                            value={data.wah_code}
                                            onChange={(e) =>
                                                setData('wah_code', e.target.value)
                                            }
                                        />
                                        {data.wah_code.length > 0 &&
                                            data.wah_code.length < 18 && (
                                                <span className="text-xs text-amber-500 italic">
                                                    Must be exactly 18 characters (Current:{' '}
                                                    {data.wah_code.length})
                                                </span>
                                            )}
                                        {errors.wah_code && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.wah_code}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
    <label className="text-xs font-bold text-muted-foreground">
        DOH/WAH Short Code
    </label>
    <Input
        required
        id="short_code"
        name="short_code"
        type="text"
        maxLength={5}
        placeholder="Wxxx1"
        value={data.short_code}
        onChange={(e) =>
            setData('short_code', e.target.value)
        }
    />
    {errors.short_code && (
        <div className="text-xs text-destructive pt-1">{errors.short_code}</div>
    )}
</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Address (PSGC)
                                    </CardTitle>
                                    <CardDescription>
                                        Select the official PSGC location fields.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            Region
                                        </label>
                                        <select
                                            required
                                            id="region"
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                            value={data.region_code}
                                            onChange={(e) => {
                                                setRegion(e.target.value);
                                                setData('region_code', e.target.value);
                                                setProvince('');
                                                setMunicipality('');
                                                setBarangay('');
                                            }}
                                        >
                                            <option value="" disabled>
                                                Select Region
                                            </option>
                                            {regions?.data?.map((r: any) => (
                                                <option key={r.psgc_10_digit_code} value={r.psgc_10_digit_code}>
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.region_code && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.region_code}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            Province
                                        </label>
                                        <select
                                            required
                                            id="province"
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                            value={data.province_code}
                                            onChange={(e) => {
                                                setProvince(e.target.value);
                                                setData('province_code', e.target.value);
                                                setMunicipality('');
                                                setBarangay('');
                                            }}
                                        >
                                            <option value="" disabled>
                                                Select Province
                                            </option>
                                            {provinces?.data?.map((p: any) => (
                                                <option key={p.psgc_10_digit_code} value={p.psgc_10_digit_code}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.province_code && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.province_code}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            Municipality
                                        </label>
                                        <select
                                            required
                                            id="municipality"
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                            value={data.municipality_code}
                                            onChange={(e) => {
                                                setMunicipality(e.target.value);
                                                setData('municipality_code', e.target.value);
                                                setBarangay('');
                                            }}
                                        >
                                            <option value="" disabled>
                                                Select Municipality
                                            </option>
                                            {municipalities?.data?.map((m: any) => (
                                                <option key={m.psgc_10_digit_code} value={m.psgc_10_digit_code}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.municipality_code && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.municipality_code}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">
                                            Barangay
                                        </label>
                                        <select
                                            required
                                            id="barangay"
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                            value={data.barangay_code}
                                            onChange={(e) => {
                                                setBarangay(e.target.value);
                                                    setData('barangay_code', e.target.value);
                                            }}
                                        >
                                            <option value="" disabled>
                                                Select Barangay
                                            </option>
                                            {barangays?.data?.map((b: any) => (
                                                <option key={b.psgc_10_digit_code} value={b.psgc_10_digit_code}>
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.barangay_code && (
                                            <div className="text-xs text-destructive pt-1">
                                                {errors.barangay_code}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2"
                                >
                                    {processing ? 'Submitting...' : submitLabel}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}