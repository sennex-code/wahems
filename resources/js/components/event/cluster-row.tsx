import { Activity, Trash } from 'lucide-react';
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';
import { Label } from '@/components/ui/label';
import { usePSGC } from '@/hooks/queries/usePSGC';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFacilitiesStore } from '@/hooks/store/facilitiesStore';

import { Input } from '../ui/input';

import { FieldGroup, FieldLabel } from '../ui/field';
import { Switch } from '../ui/switch';

import ClusterFacilityWrapper from '../cluster-row/cluster-facility-wrapper';
import ClusterLocationInputFields from '../reusable/cluster-location-input-field';
import ClusterNormalInputField from '../reusable/cluster-normal-input-field';
import { Spinner } from '../ui/spinner';

type ClusterRowType = {
    item: ClusterType;
    handleCluster: (
        name: keyof ClusterType | 'addNew' | 'delete',
        value: any,
        index?: number,
    ) => void;
    index: number;
};

const ClusterRow = ({ item, handleCluster, index }: ClusterRowType) => {
    const [isShown, setShown] = useState<boolean>(false);
    const [objectPreview, setObjectPreview] = useState<string>('');

    // Refs for closing facility dropdown when clicked outside
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const facilitiesWrapperRef = useRef<HTMLDivElement | null>(null);

    // API call to fetch regions, provinces etc.
    // const { regions, provinces, municipalities, barangays, facilities } =
    //     usePSGC({
    //         region: item.region,
    //         province: item.province,
    //         municipality: item.municipality,
    //         barangay: item.barangay,
    //     });

    const { regions, provinces, municipalities, facilities } = usePSGC({
        region: item.region,
        province: item.province,
        municipality: item.municipality,
        // barangay: item.barangay,
    });

    // Handle preview image
    useEffect(() => {
        // If its new uploaded
        if (item.logo instanceof File) {
            // Set is as preview
            const url = URL.createObjectURL(item.logo);
            setObjectPreview(url);

            return () => URL.revokeObjectURL(url);
        }

        // If it came from database, set it emmidietly
        if (typeof item.logo === 'string') {
            setObjectPreview(item.logo);
            return;
        }

        // If it's fresh, dont set anything
        setObjectPreview('');
    }, [item.logo]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                facilitiesWrapperRef.current &&
                !facilitiesWrapperRef.current.contains(target)
            ) {
                setShown(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShown(false);
            }
        };

        if (isShown) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isShown]);

    const handlePreviewImage = (
        e: ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (!e.target.files) return;

        const tmp = e.target.files[0];
        handleCluster('logo', tmp, index);
    };

    const facilitiesInUsedRaw = useFacilitiesStore(
        (state) => state.facilitiesInUsed,
    );

    const clustersInUsedRaw = useFacilitiesStore(
        (state) => state.clustersInUsed,
    );
    const clustersInUsed = useMemo(
        () => new Set(clustersInUsedRaw),
        [clustersInUsedRaw],
    );

    const facilitiesInUsed = useMemo(
        () => new Set(facilitiesInUsedRaw),
        [facilitiesInUsedRaw],
    );

    const selectedFacilityIds = useMemo(
        () =>
            new Set(
                (item.facilities ?? []).map((f: any) =>
                    typeof f === 'number' ? f : Number(f.id),
                ),
            ),
        [item.facilities],
    );
    const facilityList = facilities.data ?? [];
    const selectedCount = item.facilities?.length ?? 0;

    const isClusterUsed = useMemo(() => {
        return clustersInUsed.has(Number(item.id));
    }, [item.id, clustersInUsed]);

    return (
        <Card className="my-2 overflow-visible">
            <CardContent className="space-y-6">
                <div className="flex items-start justify-between border-b pb-4">
                    <h2 className="text-base font-semibold">
                        Cluster {index + 1}
                    </h2>

                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isClusterUsed}
                        size="icon"
                        onClick={() => handleCluster('delete', null, index)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <ClusterLocationInputFields
                        disabled={isClusterUsed}
                        id={item.id}
                        label="Region"
                        value={item.region ?? ''}
                        valueChange={(value) =>
                            handleCluster('region', value, index)
                        }
                        options={regions.data || []}
                    />

                    <ClusterLocationInputFields
                        id={item.id}
                        label="Province"
                        disabled={isClusterUsed}
                        value={item.province ?? ''}
                        valueChange={(value) =>
                            handleCluster('province', value, index)
                        }
                        options={provinces.data || []}
                    />

                    <ClusterLocationInputFields
                        disabled={isClusterUsed}
                        id={item.id}
                        label="    Municipality "
                        value={item.municipality ?? ''}
                        valueChange={(value) =>
                            handleCluster('municipality', value, index)
                        }
                        options={municipalities.data || []}
                    />

                    {/* <ClusterLocationInputFields
                        id={item.id}
                        label="Barangay"
                        value={item.barangay ?? ''}
                        valueChange={(value) =>
                            handleCluster('barangay', value, index)
                        }
                        options={barangays.data || []}
                    /> */}

                    {/* Handles multi select facilities */}
                    <ClusterFacilityWrapper
                        isShown={isShown}
                        dropdownRef={dropdownRef}
                        selectedCount={selectedCount}
                        facilityList={facilityList}
                        setShown={setShown}
                        selectedFacilityIds={selectedFacilityIds}
                        facilitiesInUsed={facilitiesInUsed}
                        handleCluster={handleCluster}
                        triggerRef={triggerRef}
                        index={index}
                        facilitiesWrapperRef={facilitiesWrapperRef}
                    ></ClusterFacilityWrapper>

                    <ClusterNormalInputField
                        id={item.id}
                        label="Cluster Name"
                        defaultValue={item.cluster_name}
                        placeHolder="Ex. Region I Cluster"
                        handleCluster={(e) =>
                            handleCluster('cluster_name', e.target.value, index)
                        }
                    ></ClusterNormalInputField>

                    <div className="col-span-1 md:col-span-2">
                        <FieldGroup className="flex flex-row rounded-xl border p-4">
                            <div className="space-y-1">
                                <FieldLabel>Custom Signatory</FieldLabel>
                                <p className="text-xs text-muted-foreground">
                                    Enable this if the cluster needs its own
                                    signatory and position.
                                </p>
                                <Switch
                                    checked={!!item.require_signatory}
                                    onCheckedChange={(checked) => {
                                        if (!checked) {
                                            handleCluster(
                                                'signatory',
                                                null,
                                                index,
                                            );
                                            handleCluster(
                                                'position',
                                                null,
                                                index,
                                            );
                                        }
                                        handleCluster(
                                            'require_signatory',
                                            checked,
                                            index,
                                        );
                                    }}
                                />
                            </div>
                        </FieldGroup>
                    </div>

                    {!!item.require_signatory && (
                        <>
                            <ClusterNormalInputField
                                id={item.id}
                                label="      Signatory"
                                defaultValue={item.signatory ?? ''}
                                placeHolder="Enter signatory name"
                                handleCluster={(e) =>
                                    handleCluster(
                                        'signatory',
                                        e.target.value,
                                        index,
                                    )
                                }
                            ></ClusterNormalInputField>

                            <ClusterNormalInputField
                                id={item.id}
                                label="Position"
                                defaultValue={item.position ?? ''}
                                placeHolder="Enter signatory position"
                                handleCluster={(e) =>
                                    handleCluster(
                                        'position',
                                        e.target.value,
                                        index,
                                    )
                                }
                            ></ClusterNormalInputField>
                        </>
                    )}

                    <div className="col-span-1 space-y-3 md:col-span-2">
                        <div className="space-y-2">
                            <Label htmlFor={`logo-${index}`}>
                                Municipality Logo
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                id={`logo-${index}`}
                                name="logo"
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handlePreviewImage(e, index);
                                    }
                                }}
                            />
                        </div>

                        {objectPreview && (
                            <div className="flex items-center gap-3 rounded-xl border p-3">
                                <img
                                    src={objectPreview}
                                    alt="Logo Preview"
                                    className="h-20 w-20 rounded-lg border object-cover"
                                />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Logo preview
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This image will be used as the cluster
                                        logo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default React.memo(ClusterRow);
