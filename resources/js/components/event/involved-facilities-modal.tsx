import { Building } from 'lucide-react';
import { type SetStateAction, type Dispatch } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

type InvolvedFacilitiesModalProps<
    T extends ReturnedClusterType | surveyClusters,
> = {
    toggleFacilitiesIncludedModal: Dispatch<SetStateAction<boolean>>;
    clusters: T[];
    isFacilitiesIncludedModalShown: boolean;
};

const InvolvedFacilitiesModal = <
    T extends ReturnedClusterType | surveyClusters,
>({
    clusters,
    isFacilitiesIncludedModalShown,
    toggleFacilitiesIncludedModal,
}: InvolvedFacilitiesModalProps<T>) => {
    console.log(clusters);
    return (
        <Dialog
            open={isFacilitiesIncludedModalShown}
            onOpenChange={toggleFacilitiesIncludedModal}
        >
            <DialogContent className="max-h-[85vh] min-w-[50%] overflow-hidden p-0">
                <div className="flex max-h-[85vh] flex-col">
                    <div className="flex flex-row items-center gap-5 px-6 pt-6">
                        <Building />
                        <h1 className="text-2xl font-extrabold">
                            INVOLVED FACILITIES
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-4">
                            {clusters.map((cluster: T, index: number) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <CardHeader className="mb-3 flex flex-row items-center gap-4 p-0">
                                            <img
                                                src={cluster.logo!}
                                                alt={cluster.cluster_name}
                                                className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover md:h-20 md:w-20"
                                            />
                                            <div className="min-w-0 text-base font-semibold wrap-break-word md:text-lg">
                                                {cluster.cluster_name}{' '}
                                            </div>
                                        </CardHeader>

                                        <CardDescription className="max-h-48 overflow-y-auto pr-2">
                                            {cluster.facilities?.map(
                                                (
                                                    facility,
                                                    facilityIndex: number,
                                                ) => (
                                                    <p
                                                        key={facilityIndex}
                                                        className="my-1 wrap-break-word"
                                                    >
                                                        -{' '}
                                                        {facility.facility_name}
                                                    </p>
                                                ),
                                            )}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="border-t px-6 py-4">
                        <DialogClose asChild>
                            <Button variant="default">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvolvedFacilitiesModal;
