/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    FileText,
    Plus,
    QrCode as QrCodeIcon,
    Search,
    SlidersHorizontal,
} from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { route } from 'ziggy-js';

import RenderRegisterForms from '@/components/attendance/forms/render-register-forms';
import AttendanceModal from '@/components/attendance/attendance-modal';
import { CreateEvents } from '@/components/event/create-events';
import AttendanceCodeModal from '@/components/event/attendance-code-modal';
import { Header } from '@/components/event/header';
import InvolvedFacilitiesModal from '@/components/event/involved-facilities-modal';
import { ParticipantTable } from '@/components/event/participant-table';
import { DeleteConfirmation } from '@/components/reusable/delete-modal';
import { TablePagination } from '@/components/reusable/table-pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import useEventHandler from '@/hooks/eventHandler';
import { participantHandler } from '@/hooks/participantsHandler';
import { usePSGC } from '@/hooks/queries/usePSGC';
import useParticipantActions from '@/hooks/utils/useParticiapantActions.utils';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import toast from 'react-hot-toast';
const MiniBadge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        {children}
    </span>
);

const SpecificEvents = ({
    event,
    eventParticipants,
    filters,
    hasExam,
    areAllPresent,
}: any) => {

    console.log("areAllPresent:", areAllPresent);
    const [isFacilitiesIncludedModalShown, toggleFacilitiesIncludedModal] =
        useState<boolean>(false);
    const [isEditEventShown, toggleEditEvent] = useState<boolean>(false);
    const [isExamsModalOpen, setExamsModalOpen] = useState<boolean>(false);

    const {
        attendanceModal,
        participantAttendance,
        openAttendance,
        closeAttendance,

        handleDeleteParticipant,
        deleteRequest,
        closeDeleteRequest,
        isDeleteParticipantShown,

        openAttendanceCode,
        closeAttendanceCode,
        attendanceCode,
        attendanceCodeModal,

        handleEditClick,
        closeEditModal,
        isRegistrationModalShown,

        toggleRegistraionModal,
        selectedParticipant,
    } = useParticipantActions();

    const {
        participantForm,
        onChangeVal,
        onCreateNewParticipant,
        onUpdateParticipant,
    } = participantHandler({
        event: event,
        closeEditModal: closeEditModal,
        participantId: selectedParticipant?.id,
    });

    const {
        event: currentEvent,
        onChangeInput,
        handleCluster,
        onUpdateEvent,
        handleDelete,
        isDeleteShown,
        toggleDeleteModal,
        eventId,
        setEventId,
        exportXLXS,

        pageOneMissing,
        pageThreeMissing,
        clusterMissing,
        pageTwoMissing,
    } = useEventHandler();

    useEffect(() => {
        if (event) {
            currentEvent.setData({
                id: event.id || '',
                name: event.name || '',
                start_at: event.start_at || '',
                end_at: event.end_at || '',
                type: event.type || 'Training',
                clusters: event.clusters || [],
                logo: event.logo || null,
                province: event.province || '',
                region: event.region || '',
                municipality: event.municipality || '',
                // barangay: event.barangay || '',
                facility_code: event.facility_code || '',
                address: event.address || '',
                leader: event.leader || '',
                position: event.position || '',
                required_hours: event.required_hours || 0,
                exam_bank: event.exams?.[0]?.bank || '',
                preExamisactive: event.exams?.[0]?.isActive || false,
                postExamisactive: event.exams?.[1]?.isActive || false,
                is_registration_active: event.is_registration_active || false,
            });
        }
    }, [event]);

    const dbPreIsActive = Boolean(event?.exams?.[0]?.isActive);
    const dbPostIsActive = Boolean(event?.exams?.[1]?.isActive);

    const [showPreQr, setShowPreQr] = useState<boolean>(dbPreIsActive);
    const [showPostQr, setShowPostQr] = useState<boolean>(dbPostIsActive);

    const switchesHydratedRef = useRef(false);

    useEffect(() => {
        setShowPreQr(dbPreIsActive);
        setShowPostQr(dbPostIsActive);
        switchesHydratedRef.current = true;
    }, [dbPreIsActive, dbPostIsActive]);

    // const { regions, provinces, municipalities, barangays, facilities } =
    //     usePSGC({
    //         region: currentEvent.data.region,
    //         province: currentEvent.data.province,
    //         municipality: currentEvent.data.municipality,
    //         barangay: currentEvent.data.barangay,
    //     });

    const { regions, provinces, municipalities, facilities } = usePSGC({
        region: currentEvent.data.region,
        province: currentEvent.data.province,
        municipality: currentEvent.data.municipality,
        // barangay: currentEvent.data.barangay,
    });

    useEffect(() => {
        if (selectedParticipant) {
            participantForm.setData({
                first_name: selectedParticipant.first_name || '',
                last_name: selectedParticipant.last_name || '',
                middle_initial: selectedParticipant.middle_initial || '',
                suffix: selectedParticipant.suffix || '',
                age: Number(selectedParticipant.age) || 0,
                birthday: selectedParticipant.birthday || '',
                designation: selectedParticipant.designation || '',
                gender: selectedParticipant.gender || '',
                facility_name: selectedParticipant.facility_name || '',
                email: selectedParticipant.email || '',
                mobile_number: selectedParticipant.mobile_number || '',
                cluster_id: selectedParticipant?.cluster_id || '',
                cpd: selectedParticipant?.cpd || false,
                prc_license: selectedParticipant.prc_license || '',
                expiry_date: selectedParticipant.expiry_date || '',
            });
        } else {
            participantForm.reset();
        }
    }, [selectedParticipant]);

    const [search, setSearch] = useState(filters.search || '');
    useEffect(() => {
        if ((filters.search ?? '') === search) return;

        const timer = setTimeout(() => {
            router.get(
                route('event.show', { event: event.id }),
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['eventParticipants', 'filters'],
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const preVerifyUrl = useMemo(() => {
        return route('exam.verifyParticipantEligibility', {
            eventId: event.id,
            examType: 'pre',
        });
    }, [event.id]);

        const [facilitators, setFacilitators] = useState<any[]>([]);
    

      // Fetch facilitators on component mount
    useEffect(() => {
        const getFacilitators = async () => {
            try {
                const response = await axios.get("/facilitators");
                setFacilitators(response.data.facilitators);
            } catch (error) {
                console.log("Error fetching facilitators.");
                console.error("Error fetching facilitators:", error);
            }
        };

        getFacilitators();
    }, []);

    const postVerifyUrl = useMemo(() => {
        return route('exam.verifyParticipantEligibility', {
            eventId: event.id,
            examType: 'post',
        });
    }, [event.id]);

    useEffect(() => {
        if (!switchesHydratedRef.current) return;
        if (showPreQr === dbPreIsActive) return;

        router.post(
            route('examAttempts.setIsActive', {
                eventId: event.id,
                examType: 'pre',
                isActive: showPreQr ? 1 : 0,
            }),
            {},
            { preserveScroll: true },
        );
    }, [showPreQr, dbPreIsActive, event.id]);

    useEffect(() => {
        if (!switchesHydratedRef.current) return;
        if (showPostQr === dbPostIsActive) return;

        router.post(
            route('examAttempts.setIsActive', {
                eventId: event.id,
                examType: 'post',
                isActive: showPostQr ? 1 : 0,
            }),
            {},
            { preserveScroll: true },
        );
    }, [showPostQr, dbPostIsActive, event.id]);

    const registrationUrl = `${window.location.origin}/user-register/${event.id}`;

    console.log("event:", event);


    const [validDays, setValidDays] = useState(false);


const markEveryonePresentToday=(evntId: number) => {

    axios.post(route('attendance.presentAllParticipantToday', { eventId: evntId }))
    .then(response => {
        toast.success('All participants marked as present for today!', {
            position: 'top-right',
        });
       window.location.reload();
    })
    .catch(error => {
        console.error('Error marking all participants as present:', error);
    });
}

    const checkValidDays = () => {
        const today = new Date();
        const startDate = new Date(event.start_at);
        const endDate = new Date(event.end_at);
    
        if (today >= startDate && today <= endDate) {
            setValidDays(true);
        } else {setValidDays(false);}
    };

    useEffect(() => {
        checkValidDays();
    }, [event]);

    return (
        <AppLayout>
            <Head title={event?.name ?? 'Event Details'} />

            <div className="flex flex-col gap-6 p-6 md:p-12">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-black text-foreground md:text-3xl">
                                Event Details
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manage registration, participants, attendance, and
                            exam access for this event.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_360px]">
                    <Card className="h-fit w-full">
                        <CardHeader className="border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        Event Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Review key event information and manage
                                        quick actions.
                                    </CardDescription>
                                </div>

                                <Badge variant="secondary">
                                    {event.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 md:p-5">
                            <Header
                                event={event}
                                involvedFacilities={() =>
                                    toggleFacilitiesIncludedModal(
                                        (prev) => !prev,
                                    )
                                }
                                editEvent={() =>
                                    toggleEditEvent((prev) => !prev)
                                }
                                deleteEvent={() => {
                                    toggleDeleteModal(true);
                                    setEventId(event.id);
                                }}
                                exams={() => setExamsModalOpen(true)}
                                hasExam={hasExam}
                                facilitators={event.facilitators}
                            />
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader className="border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <QrCodeIcon className="h-4 w-4 text-primary" />
                                        Registration QR
                                    </CardTitle>
                                    <CardDescription>
                                        Share this QR code so participants can
                                        register for the event.
                                    </CardDescription>
                                </div>

                                <MiniBadge>
                                    {currentEvent.data.is_registration_active
                                        ? 'Open'
                                        : 'Closed'}
                                </MiniBadge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 p-4 md:p-5">
                            <Link
                                href={route('user-register-event.show', {
                                    eventId: event.id,
                                })}
                                className="block rounded-xl border bg-background p-4 transition hover:bg-accent/30"
                            >
                                <QRCode
                                    size={500}
                                    style={{
                                        height: 'auto',
                                        maxWidth: '100%',
                                        width: '100%',
                                    }}
                                    value={registrationUrl}
                                    viewBox="0 0 256 256"
                                />
                            </Link>

                            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        Registration Access
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Toggle whether registration is open for
                                        this event.
                                    </p>
                                </div>

                                <Switch
                                    checked={
                                        currentEvent.data
                                            .is_registration_active || false
                                    }
                                    onCheckedChange={(checked) => {
                                        router.patch(
                                            route('event.toggle', {
                                                event: event,
                                            }),
                                            {
                                                is_registration_active: checked,
                                            },
                                        );
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="w-full">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                                    Participants
                                </CardTitle>
                                <CardDescription>
                                    Search, export, and manage participant
                                    records for this event.
                                </CardDescription>
                            </div>

                            <MiniBadge>
                                {eventParticipants?.data?.length ?? 0} shown
                            </MiniBadge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-4 md:p-5">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                            <InputGroup>
                                <InputGroupInput
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search participant name or email..."
                                    className="w-full"
                                />
                                <InputGroupAddon>
                                    <Search className="h-4 w-4" />
                                </InputGroupAddon>
                            </InputGroup>

                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => exportXLXS(event.id)}
                                className="w-full lg:w-auto"
                            >
                                <Download className="h-4 w-4" />
                                Download XLSX
                            </Button>
                            

                            {event.status !== 'Finished' && (
                                <Button
                                    size="lg"
                                    className="w-full lg:w-auto"
                                    onClick={() => {
                                        toggleRegistraionModal((prev) => !prev);
                                        participantForm.reset();
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Participant
                                </Button>
                            )}

                            {validDays && event.status !== 'Finished' && eventParticipants?.data?.length > 0 &&  (
                                <Button className={`bg-green-500 w-full col-span-3 hover:bg-green-600 ${areAllPresent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => markEveryonePresentToday(event.id)}
                                disabled={areAllPresent}

                                >    
                                    {areAllPresent ? 'All Participants Marked Present' : 'Mark All as Present Today' }
                                </Button>
                            )}

                            
                        </div>

                        <Card className="overflow-hidden">
                            <ParticipantTable
                                eventParticipants={eventParticipants.data}
                                handleEditClick={handleEditClick}
                                eventType={event.type}
                                openAttendance={openAttendance}
                                openAttendanceCode={openAttendanceCode}
                                deleteRequest={deleteRequest}
                                event_status={event.status}
                            />
                        </Card>
                    </CardContent>
                </Card>

                <Dialog
                    open={isExamsModalOpen}
                    onOpenChange={() => setExamsModalOpen(false)}
                >
                    <DialogContent className="max-h-[90vh] min-w-5xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Event Exams</DialogTitle>
                            <DialogDescription>
                                Open the verification page directly or let
                                participants scan the QR code.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="border-b border-border bg-muted/20">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                Pre Test
                                            </CardTitle>
                                            <CardDescription>
                                                Control QR visibility and
                                                access.
                                            </CardDescription>
                                        </div>

                                        <Switch
                                            checked={showPreQr}
                                            onCheckedChange={setShowPreQr}
                                        />
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 p-4">
                                    {showPreQr ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.get(preVerifyUrl)
                                            }
                                            className="w-full rounded-xl border bg-background p-4 text-left transition hover:bg-accent/30"
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold">
                                                        Pre Test Verification
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Click to open or scan on
                                                        mobile
                                                    </div>
                                                </div>
                                                <MiniBadge>Open</MiniBadge>
                                            </div>

                                            <div className="rounded-lg border bg-background p-3">
                                                <QRCode
                                                    size={220}
                                                    style={{
                                                        height: 'auto',
                                                        maxWidth: '100%',
                                                        width: '100%',
                                                    }}
                                                    value={preVerifyUrl}
                                                    viewBox="0 0 256 256"
                                                />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            Pre test QR is currently hidden.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="border-b border-border bg-muted/20">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">
                                                Post Test
                                            </CardTitle>
                                            <CardDescription>
                                                Control QR visibility and
                                                access.
                                            </CardDescription>
                                        </div>

                                        <Switch
                                            checked={showPostQr}
                                            onCheckedChange={setShowPostQr}
                                        />
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 p-4">
                                    {showPostQr ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.get(postVerifyUrl)
                                            }
                                            className="w-full rounded-xl border bg-background p-4 text-left transition hover:bg-accent/30"
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold">
                                                        Post Test Verification
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Click to open or scan on
                                                        mobile
                                                    </div>
                                                </div>
                                                <MiniBadge>Open</MiniBadge>
                                            </div>

                                            <div className="rounded-lg border bg-background p-3">
                                                <QRCode
                                                    size={220}
                                                    style={{
                                                        height: 'auto',
                                                        maxWidth: '100%',
                                                        width: '100%',
                                                    }}
                                                    value={postVerifyUrl}
                                                    viewBox="0 0 256 256"
                                                />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            Post test QR is currently hidden.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isRegistrationModalShown}
                    onOpenChange={closeEditModal}
                >
                    <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-y-auto">
                        <form
                            onSubmit={
                                selectedParticipant
                                    ? onUpdateParticipant
                                    : onCreateNewParticipant
                            }
                        >
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedParticipant
                                        ? 'Edit Participant'
                                        : 'Add Participant'}
                                </DialogTitle>
                                <DialogDescription>
                                    Fill out the participant details below.
                                </DialogDescription>
                            </DialogHeader>

                            {RenderRegisterForms({
                                event_type: event.type,
                                clusters: event.clusters,
                                facility_name: event.facility,
                                participantForm: participantForm,
                                onChangeVal: onChangeVal,
                                type: 'Add',
                            }) ?? <p />}
                        </form>
                    </DialogContent>
                </Dialog>

                <CreateEvents
                    eventAction="Updating"
                    eventProcessing={currentEvent.processing}
                    isCreateModalShown={isEditEventShown}
                    toggleCreateModal={toggleEditEvent}
                    onSubmit={(e: any) => onUpdateEvent(e)}
                    event={currentEvent.data}
                    onChangeInput={onChangeInput}
                    regions={regions.data}
                    provinces={provinces.data}
                    municipalities={municipalities.data}
                    eventSelectedFacilitators={event.facilitators}
                    // barangays={barangays.data}
                    facilities={facilities.data ?? []}
                    handleCluster={handleCluster}
                    clusters={currentEvent.data.clusters}
                    pageOneMissing={pageOneMissing}
                    pageThreeMissing={pageThreeMissing}
                    clusterMissing={clusterMissing}
                    pageTwoMissing={pageTwoMissing}
                />

                <InvolvedFacilitiesModal
                    clusters={event.clusters}
                    isFacilitiesIncludedModalShown={
                        isFacilitiesIncludedModalShown
                    }
                    toggleFacilitiesIncludedModal={
                        toggleFacilitiesIncludedModal
                    }
                />

                {isDeleteParticipantShown && (
                    <DeleteConfirmation
                        toggleDeleteModal={() => closeDeleteRequest()}
                        onAction={() => handleDeleteParticipant()}
                        isDeleteShown={isDeleteParticipantShown}
                    />
                )}

                {participantAttendance && (
                    <AttendanceModal
                        participantAttendance={participantAttendance}
                        attendanceModal={attendanceModal}
                        toggleAttendanceModal={() => closeAttendance()}
                    />
                )}

                {attendanceCode && (
                    <AttendanceCodeModal
                        attendanceCode={attendanceCode}
                        attendanceCodeModal={attendanceCodeModal}
                        toggleAttendanceCodeModal={() => {
                            closeAttendanceCode();
                        }}
                    />
                )}

                {isDeleteShown && (
                    <DeleteConfirmation
                        onAction={() => handleDelete(Number(eventId))}
                        isDeleteShown={isDeleteShown}
                        toggleDeleteModal={() =>
                            toggleDeleteModal((prev) => !prev)
                        }
                    />
                )}

                <div className="mt-2">
                    <TablePagination links={eventParticipants.links} />
                </div>
            </div>
        </AppLayout>
    );
};

export default SpecificEvents;
