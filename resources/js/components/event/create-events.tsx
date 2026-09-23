import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@radix-ui/react-label';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Card, CardContent, CardDescription } from '../ui/card';

import { renderOptions } from './render-options';
import { eventType } from '@/constants/constant';
import { AnimatePresence, motion } from 'motion/react';
import { allowNumbersOnly, removeEmojis } from '@/hooks/utils/textRestrictions';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { ChevronDown, X, Check } from 'lucide-react';
import { set } from 'date-fns';
import axios from 'axios';

type Facilitator = {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
};

type CreateEventsType = {
    pageOneMissing: (keyof EventType)[];
    pageTwoMissing: (keyof EventType)[];
    pageThreeMissing: (keyof EventType)[];
    clusterMissing: { index: number; missing: (keyof ClusterType)[] }[];
    isCreateModalShown: boolean;
    toggleCreateModal: Dispatch<SetStateAction<boolean>>;
    onSubmit: (e: any, onSuccessClose?: () => void) => void;
    event: any;
    onChangeInput: (fieldName: keyof EventType, value: any) => void;
    regions: RegionsType[];
    provinces: ProvinceType[];
    municipalities: MunicipalityType[];
    facilities: FacilityType[];
    eventSelectedFacilitators?: Facilitator[];
   
    handleCluster: (
        fieldName: keyof ClusterType | 'addNew' | 'delete',
        value?: any,
        index?: number,
    ) => void;
    clusters?: any;
    eventAction: 'Updating' | 'Creating';
    eventProcessing: boolean;
};

export const CreateEvents = ({
    pageOneMissing,
    pageTwoMissing,
    clusterMissing,
    eventProcessing,
    regions,
    provinces,
    municipalities,
    facilities,
    eventSelectedFacilitators,
    isCreateModalShown,
    toggleCreateModal,
    onSubmit,
    event,
    onChangeInput,
    handleCluster,
    clusters,
    eventAction,
}: CreateEventsType) => {
    console.log(event);
    const [[step, direction], setStep] = useState<[number, number]>([0, 1]);
    const [facilitators, setFacilitators] = useState<Facilitator[] | null>(null);
    const [facilitatorSearch, setFacilitatorSearch] = useState('');
    const [facilitatorDropdownOpen, setFacilitatorDropdownOpen] = useState(false);

    const totalSteps = 3;

    const isExamBankAllowed = useMemo(() => {
        return event?.type === 'Cluster' || event?.type === 'Training';
    }, [event?.type]);

    const fetchFacilitators = async () => {
        try {
            const response = await axios.get("/facilitators");
            setFacilitators(response.data.facilitators);
            return response.data.facilitators;
        } catch (error) {
            toast.error("Error fetching facilitators.");
            console.error("Error fetching facilitators:", error);
            return [];
        }
    };

    // ✅ Initialize facilitator_ids when updating
    useEffect(() => {
        if (eventAction === 'Updating' && eventSelectedFacilitators && eventSelectedFacilitators.length > 0) {
            const selectedIds = eventSelectedFacilitators.map((f) => f.id);
            onChangeInput('facilitator_ids', selectedIds);
        }
    }, [eventAction, eventSelectedFacilitators, isCreateModalShown]);

    useEffect(() => {
        fetchFacilitators();
    }, []);

    // ✅ Filter facilitators based on search and sort selected to top
    const filteredFacilitators = useMemo(() => {
        const facsArray = Array.isArray(facilitators) ? facilitators : [];
        const selectedIds = event.facilitator_ids || [];

        let filtered = facsArray;

        // Filter by search term
        if (facilitatorSearch) {
            filtered = filtered.filter((f) =>
                f.name.toLowerCase().includes(facilitatorSearch.toLowerCase())
            );
        }

        // Sort: selected first, then alphabetically
        return filtered.sort((a, b) => {
            const aSelected = selectedIds.includes(a.id);
            const bSelected = selectedIds.includes(b.id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [facilitators, facilitatorSearch, event.facilitator_ids]);

    console.log("selected facilitators:", eventSelectedFacilitators);

    // ✅ Get selected facilitators sorted to top - with safety check
    const selectedFacilitators = useMemo(() => {
        const facsArray = Array.isArray(facilitators) ? facilitators : [];
        return facsArray.filter((f) =>
            (event.facilitator_ids || []).includes(f.id)
        );
    }, [event.facilitator_ids, facilitators]);

    // Handle multiple facilitator selection
    const handleFacilitatorSelect = (facilitatorId: number) => {
        const currentFacilitators = event.facilitator_ids || [];
        const isSelected = currentFacilitators.includes(facilitatorId);

        if (isSelected) {
            // Remove if already selected
            onChangeInput(
                'facilitator_ids',
                currentFacilitators.filter((id: number) => id !== facilitatorId)
            );
        } else {
            // Add if not selected
            onChangeInput('facilitator_ids', [...currentFacilitators, facilitatorId]);
        }
    };

    const go = (dir: number) => {
        const nextStep = step + dir;
        if (nextStep < 0 || nextStep >= totalSteps) return;

        if (dir > 0) {
            if (step === 0 && pageOneMissing.length > 0) {
                toast.error(
                    `${pageOneMissing.length} required field(s) are missing!`,
                    {
                        description: pageOneMissing.join(', '),
                    },
                );
                return;
            }

            if (
                step === 1 &&
                pageTwoMissing.length > 0 &&
                (event.type === 'Workshop' ||
                    event.type === 'Meeting' ||
                    event.type === 'Training' ||
                    event.type === 'Cluster')
            ) {
                toast.error(
                    `${pageTwoMissing.length} required field(s) are missing!`,
                    {
                        description: pageTwoMissing.join(', '),
                        classNames: {
                            description: 'text-red-500',
                        },
                    },
                );
                return;
            }

            if (step === 1 && event.type === 'Cluster') {
                const firstInvalidCluster = clusterMissing.find(
                    (item) => item.missing.length > 0,
                );

                if (firstInvalidCluster) {
                    toast.error('Some cluster fields are missing!', {
                        description: `Cluster ${firstInvalidCluster.index + 1}: ${firstInvalidCluster.missing.join(', ')}`,
                    });
                    return;
                }
            }
        }

        setStep([nextStep, dir]);
    };

    const stepsVariant = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({
            x: dir > 0 ? -100 : 100,
            opacity: 0,
        }),
    };

    const progress = ((step + 1) / totalSteps) * 100;
    const handleOpenChange = (open: boolean) => {
        toggleCreateModal(open);
        if (!open) {
            setStep([0, 1]);
        }
    };

    const steps = [
        // STEP 1
        <Card key="step-1" className="h-full">
            <CardContent className="flex h-full flex-col gap-5">
                <div className="flex flex-col">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        value={event.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            onChangeInput('name', removeEmojis(e.target.value));
                        }}
                        id="name"
                        name="name"
                        required
                        placeholder="Event Name"
                        className="mt-2 rounded border px-2 py-2 shadow-2xs"
                    />
                </div>

                <div className="flex flex-col">
                    <Label htmlFor="start_at">Start Date</Label>
                    <Input
                        value={
                            event.start_at
                                ? String(event.start_at).split('T')[0]
                                : ''
                        }
                        type="date"
                        id="start_at"
                        name="start_at"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChangeInput('start_at', e.target.value)
                        }
                        required
                        className="mt-2 rounded border px-2 py-2 shadow-2xs"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="flex flex-col">
                    <Label htmlFor="end_at">End Date</Label>
                    <Input
                        value={
                            event.end_at
                                ? String(event.end_at).split('T')[0]
                                : ''
                        }
                        type="date"
                        id="end_at"
                        name="end_at"
                        disabled={!event.start_at}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChangeInput('end_at', e.target.value)
                        }
                        required
                        min={String(event.start_at).split('T')[0] || ''}
                        className="mt-2 rounded border px-2 py-2 shadow-2xs"
                    />
                </div>

                <div className="flex flex-col">
                    <Label htmlFor="type">Type</Label>
                    <Select
                        value={event.type}
                        onValueChange={(value) => {
                            onChangeInput('type', value);

                            if (value !== 'Cluster' && value !== 'Training') {
                                onChangeInput('exam_bank', '');
                            }
                        }}
                        required
                        disabled={eventAction === 'Updating'}
                    >
                        <SelectTrigger
                            className={`mt-2 rounded border px-2 py-2 text-left ${
                                eventAction === 'Updating'
                                    ? 'cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {eventType.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isExamBankAllowed && (
                    <div className="mt-2 flex flex-col space-y-2">
                        <Label htmlFor="exam_bank" className="place-self-start">
                            Exam Type
                        </Label>

                        <Select
                            value={event.exam_bank ?? ''}
                            onValueChange={(value) =>
                                onChangeInput('exam_bank', value)
                            }
                            required
                        >
                            <SelectTrigger className="mt-2 rounded border px-2 py-2 text-left">
                                <SelectValue placeholder="Select Exam Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">
                                    Private Facility Exam
                                </SelectItem>
                                <SelectItem value="lgu">
                                    RHU/CHC Exam
                                </SelectItem>
                                <SelectItem value="specialized">
                                    Specialized Facility Exam
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>,

        // STEP 2
        <div key="step-2">
            {renderOptions({
                toRender: event.type,
                event: event,
                regions: regions ?? [],
                provinces: provinces ?? [],
                municipalities: municipalities ?? [],
                facilities: facilities ?? [],
                clusters: clusters,
                handleCluster: handleCluster,
                onChangeInput: onChangeInput,
            }) ?? (
                <Card>
                    <CardContent>
                        <p>No event type selected.</p>
                    </CardContent>
                </Card>
            )}
        </div>,

        // STEP 3
        <Card key="step-3">
            <CardContent className="flex flex-col gap-5">
                {event.type !== 'Cluster' && (
                    <>
                        <div className="flex flex-col">
                            <Label htmlFor="leader">Name of Signatory</Label>
                            <Input
                                id="leader"
                                name="leader"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    onChangeInput(
                                        'leader',
                                        removeEmojis(e.target.value),
                                    )
                                }
                                value={event.leader}
                          
                                className="mt-2 rounded border px-2 py-2 shadow-2xs"
                                placeholder="Hon. (Name of the Municipal Head)"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="position">
                                Position/Designation
                            </Label>
                            <Input
                                id="position"
                                name="position"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    onChangeInput(
                                        'position',
                                        removeEmojis(e.target.value),
                                    )
                                }
                                value={event.position}
                              
                                className="mt-2 rounded border px-2 py-2 shadow-2xs"
                                placeholder="ex. Mayor/Kagawad/Kapitan"
                            />
                        </div>
                    </>
                )}

                <div className="flex flex-col">
                    <Label htmlFor="required_hours">
                        Required Number of Hours
                    </Label>
                    <Input
                        id="required_hours"
                        type="number"
                        name="required_hours"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChangeInput(
                                'required_hours',
                                allowNumbersOnly(e.target.value),
                            )
                        }
                        value={event.required_hours}
                        required
                        className="mt-2 rounded border px-2 py-2 shadow-2xs"
                        placeholder="ex. 8"
                    />
                </div>

                {/* FACILITATORS DROPDOWN BUTTON */}
                <div className="flex flex-col">
                    <Label className="flex items-center gap-1">
                        Facilitators
                        <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setFacilitatorDropdownOpen(!facilitatorDropdownOpen)
                            }
                            className={`w-full justify-between ${
                                (!event.facilitator_ids ||
                                    event.facilitator_ids.length === 0)
                                    ? 'border-red-500 border-2'
                                    : ''
                            }`}
                        >
                            <span>
                                {(event.facilitator_ids || []).length > 0
                                    ? `${(event.facilitator_ids || []).length} Facilitator(s) Selected`
                                    : 'Select Facilitators'}
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                    facilitatorDropdownOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </Button>

                        {/* Dropdown Menu */}
                        {facilitatorDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-muted border rounded-md  shadow-lg">
                                {/* Selected Facilitators at Top */}
                                {selectedFacilitators.length > 0 && (
                                    <div className="border-b p-3 bg-muted">
                                        <p className="text-xs font-semibold  mb-2">
                                            SELECTED
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedFacilitators.map((facilitator) => (
                                                <div
                                                    key={facilitator.id}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 group hover:bg-blue-600 transition-colors"
                                                >
                                                    {facilitator.name}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFacilitatorSelect(
                                                                facilitator.id
                                                            );
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Search Input */}
                                <div className="p-2 border-b">
                                    <Input
                                        id="facilitator_search"
                                        name="facilitator_search"
                                        type="text"
                                        placeholder="Search facilitators..."
                                        value={facilitatorSearch}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setFacilitatorSearch(e.target.value)
                                        }
                                        className="rounded border px-2 py-2"
                                    />
                                </div>

                                {/* Facilitators List */}
                                <div className="max-h-48 overflow-y-auto p-2 space-y-2">
                                    {filteredFacilitators.length > 0 ? (
                                        filteredFacilitators.map((facilitator) => {
                                            const isSelected = (event.facilitator_ids || []).includes(facilitator.id);
                                            return (
                                                <div
                                                    key={facilitator.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                                        isSelected
                                                            ? ' bg-muted'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                    onClick={() =>
                                                        handleFacilitatorSelect(
                                                            facilitator.id,
                                                        )
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`facilitator-${facilitator.id}`}
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                                                    />
                                                    <Label
                                                        htmlFor={`facilitator-${facilitator.id}`}
                                                        className="cursor-pointer flex-1 m-0"
                                                    >
                                                        {facilitator.name}
                                                    </Label>
                                                    {/* ✅ Show checkmark for selected */}
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-blue-500 font-bold" />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm  p-2">
                                            No facilitators found
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {(!event.facilitator_ids ||
                        event.facilitator_ids.length === 0) && (
                        <p className="text-sm text-red-500 mt-1">
                            At least one facilitator is required
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>,
    ];

    return (
        <Dialog open={isCreateModalShown} onOpenChange={handleOpenChange}>
            <DialogContent className="flex h-[85vh] min-w-[50%] flex-col">
                <form
                    onSubmit={(e) => {
                        if (
                            !event.facilitator_ids ||
                            event.facilitator_ids.length === 0
                        ) {
                            e.preventDefault();
                            toast.error(
                                'Please select at least one facilitator!'
                            );
                            return;
                        }
                        onSubmit(e, () => handleOpenChange(false));
                    }}
                    className="flex flex-1 flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>
                            {eventAction === 'Updating'
                                ? 'Update Event'
                                : 'Create Event'}
                        </DialogTitle>
                        <CardDescription>
                            Fill in the following to {eventAction.toLowerCase()}{' '}
                            an Event
                        </CardDescription>

                        {eventAction === 'Creating' && (
                            <div className="mx-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    initial={false}
                                    className="h-full bg-green-300"
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                        duration: 0.35,
                                        ease: 'easeInOut',
                                    }}
                                />
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden px-4 py-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={stepsVariant}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.1, ease: 'linear' }}
                            >
                                {steps[step]}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-row justify-between px-3">
                        <div className="flex flex-row gap-5">
                            <Button
                                type="button"
                                onClick={() => go(-1)}
                                disabled={step === 0 || eventProcessing}
                            >
                                Prev
                            </Button>

                            <Button
                                type="button"
                                onClick={() => go(1)}
                                disabled={
                                    step >= totalSteps - 1 || eventProcessing
                                }
                            >
                                Next
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                step !== totalSteps - 1 ||
                                eventProcessing ||
                                !event.facilitator_ids ||
                                event.facilitator_ids.length === 0
                            }
                        >
                            {eventProcessing && <Spinner></Spinner>}
                            {eventAction === 'Updating'
                                ? 'Update Event'
                                : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};