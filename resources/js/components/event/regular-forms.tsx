import { useEffect, useState, type ChangeEvent } from 'react';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Input } from '@/components/ui/input';

type TrainingFormsType = {
    event: {
        region?: string;
        province?: string;
        municipality?: string;
        barangay?: string;
        address: string;
        logo?: File | string | undefined;
    };
    regions: RegionsType[];
    provinces: ProvinceType[];
    municipalities: MunicipalityType[];
    // barangays: BarangayType[];

    onChangeInput: (name: keyof EventType, value: any) => void;
};

const RegularForms = ({
    event,
    regions,
    provinces,
    municipalities,
    // barangays,
    onChangeInput,
}: TrainingFormsType) => {
    const [objectPreview, setObjectPreview] = useState<string>('');

    useEffect(() => {
        if (event.logo instanceof File) {
            const url = URL.createObjectURL(event.logo);
            setObjectPreview(url);

            return () => URL.revokeObjectURL(url);
        }

        if (typeof event.logo === 'string') {
            setObjectPreview(event.logo);
            return;
        }

        setObjectPreview('');
    }, [event.logo]);
    const handlePreviewImage = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const tmp = e.target.files[0];

        onChangeInput('logo', tmp);
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="w-full">
                        <Label htmlFor="region">Region</Label>
                        <Select
                            value={event.region || ''}
                            onValueChange={(value) =>
                                onChangeInput('region', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                            <SelectContent>
                                {regions.map((item: RegionsType) => (
                                    <SelectItem
                                        key={item.psgc_10_digit_code}
                                        value={item.psgc_10_digit_code}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full">
                        <Label htmlFor="province">Province</Label>
                        <Select
                            value={event.province || ''}
                            onValueChange={(value) =>
                                onChangeInput('province', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Province" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map((item: ProvinceType) => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.psgc_10_digit_code}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full">
                        <Label htmlFor="municipality">Municipality</Label>
                        <Select
                            value={event.municipality || ''}
                            onValueChange={(value) =>
                                onChangeInput('municipality', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Municipality" />
                            </SelectTrigger>
                            <SelectContent>
                                {municipalities.map(
                                    (item: MunicipalityType) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.psgc_10_digit_code}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* <div className="w-full">
                        <Label htmlFor="barangay">Barangay</Label>
                        <Select
                            value={event.barangay || ''}
                            onValueChange={(value) =>
                                onChangeInput('barangay', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Barangay" />
                            </SelectTrigger>
                            <SelectContent>
                                {barangays.map((item: BarangayType) => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.psgc_10_digit_code}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div> */}

                    <div className="md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <p className="text-sm text-muted-foreground">
                            Enter the full address of the event location, this will be used in the certificate.
                        </p>
                        <Input
                            id="address"
                            name="address"
                            value={event.address || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChangeInput('address', e.target.value)
                            }
                            placeholder="Block/Street/Address"
                            className="mt-2 w-full"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="logo">Municipality Logo</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            id="logo"
                            name="logo"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (e.target.files && e.target.files[0]) {
                                    handlePreviewImage(e);
                                }
                            }}
                            className="mt-2 w-full"
                        />

                        {objectPreview && (
                            <img
                                src={objectPreview}
                                alt="Logo Preview"
                                className="mt-2 h-20 w-20 rounded border object-cover shadow-2xs"
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default React.memo(RegularForms);
