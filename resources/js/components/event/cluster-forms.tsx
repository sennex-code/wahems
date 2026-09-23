import { Plus } from 'lucide-react';
import { useEffect, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';

import ClusterRow from './cluster-row';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useFacilitiesStore } from '@/hooks/store/facilitiesStore';

type ClusterFormType = {
    clusterAddress: {
        region?: string;
        province?: string;
        municipality?: string;
        barangay?: string;
        address: string;
        id?: string;
    };
    clusters: ClusterType[] | undefined;
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
        index?: number,
    ) => void;

    regions: RegionsType[];
    provinces: ProvinceType[];
    municipalities: MunicipalityType[];
    // barangays: BarangayType[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChangeInput: (name: keyof EventType, value: any) => void;
};
export const ClusterForms = ({
    clusters,
    clusterAddress,
    handleCluster,
    regions,
    provinces,
    municipalities,
    // barangays,
    onChangeInput,
}: ClusterFormType) => {
    return (
        <div className="max-h-[65vh] overflow-y-auto pr-2">
            {' '}
            {clusters?.map((item, index: number) => {
                return (
                    <ClusterRow
                        key={item.id ?? `cluster-${index}`}
                        item={item}
                        handleCluster={handleCluster}
                        index={index}
                    ></ClusterRow>
                );
            })}
            <Button
                type="button"
                className="my-2 w-full"
                onClick={() => handleCluster('addNew', null)}
            >
                <Plus></Plus>
            </Button>
            <Card>
                <CardHeader>Event Address</CardHeader>
                <CardContent>
                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            {/* Region */}
                            <div className="w-full">
                                <Label htmlFor="region">Region</Label>
                                <Select
                                    value={clusterAddress.region}
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

                            {/* Province */}
                            <div className="w-full">
                                <Label htmlFor="province">Province</Label>
                                <Select
                                    value={clusterAddress.province}
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

                            {/* Municipality */}
                            <div className="w-full">
                                <Label htmlFor="municipality">
                                    Municipality
                                </Label>
                                <Select
                                    value={clusterAddress.municipality}
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
                                                    value={
                                                        item.psgc_10_digit_code
                                                    }
                                                >
                                                    {item.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Barangay */}
                            {/* <div className="w-full">
                                <Label htmlFor="barangay">Barangay</Label>
                                <Select
                                    value={clusterAddress.barangay}
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

                            {/* Address Input */}
                            <div className="col-span-2">
                                <Label htmlFor="address">Address</Label>
                                 <p className=" ml-2 text-sm text-muted-foreground text-purple-700">
                            Enter the full address of the event location, this will be used in the certificate.
                        </p>
                                <Input
                                    name="address"
                                    value={clusterAddress.address}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        onChangeInput('address', e.target.value)
                                    }
                                    placeholder="Block/Street/Address"
                                    className="mt-2 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
