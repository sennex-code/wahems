import axios from 'axios';

import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from '@/components/ui/card';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

import { MedTechCertPdfDocument } from './certificateTemps/MedTechCert.pdf';
import { pdf } from '@react-pdf/renderer';

// react-hot-toast
import toast from 'react-hot-toast';

// Reference-style imports (for table actions dropdown)
import { MoreHorizontalIcon, ShieldCheck, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Empty state (same pattern as your reference)
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import Lottie from 'lottie-react';
import errorAnimation from '../../lottie/NoResult.json';
import { route } from 'ziggy-js';
import { TablePagination } from '@/components/reusable/table-pagination';
import event from '@/routes/event';
import InvolvedFacilitiesModal from '@/components/event/involved-facilities-modal';

// --- TypeScript Types ---
type EHRModule = string;

const MAX_TOPICS = 25;

const EHR_OPTIONS: EHRModule[] = [
    'User Accounts Management',
    'Patient Information Recording and Management',
    'Medical Consultation Recording and Management',
    'Laboratory and Diagnostics Services Management',
    'Philippine PEN Risk Assessment Management',
    "DOH's Maternal Care Program",
    "DOH's Child Care Program",
    "DOH's Family Planning Program",
    "DOH's TB DOTS Program",
    "DOH's Animal Bite Program",
    "DOH's Dental Care Program",
    "DOH's Environmental and Sanitation Program",
    'Adolescent Sexual and Reproductive Health Module',
    'Mental Health Module',
    'Electronic Inter-facility Referral Module',
    'Death Record Module',
    'PhilHealth e-Claims and Konsulta Orientation',
    'Health Reports Generation and Data Analytics',
];

// Helper: trigger browser download for a Blob
async function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

type Props = {
    events: any;
    filters?: {
        search?: string;
    };
};

const Certificates = ({ events, filters }: Props) => {
    const [eventInfo, setEventInfo] = useState<any>({
        id: '',
        name: '',
        type: '',
        participants: [] as any[],
        clusters: [] as any[],
    });

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Track which participant is currently downloading (so only that row shows "Preparing...")
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Track which participant is currently being emailed
    const [sendingId, setSendingId] = useState<number | null>(null);

    // Global Configuration
    const [isCPD, setIsCPD] = useState(true);
    const [clusteSort, setClusteSort] = useState('all');

    // Topics Logic
    const [isDropdownShown, setDropdownShown] = useState(false);
    const [selectedModules, setSelectedModules] =
        useState<EHRModule[]>(EHR_OPTIONS);
    const [customTopics, setCustomTopics] = useState<string[]>(['']);

    // --- INDIVIDUAL PARTICIPANT STATES ---
    const [includeWAHSignatories, setIncludeWAHSignatories] = useState<
        Record<number, boolean>
    >({});
    const [cpdValues, setCpdValues] = useState<Record<number, string>>({});

    // --- INDIVIDUAL PARTICIPANT ACCRED CODE (NEW) ---
    const [accredValues, setAccredValues] = useState<Record<number, string>>({});

    const [designation, setDesignation] = useState<string[]>([]);
    const [designationSort, setDesignationSort] = useState('all');

    // Bulk-accreditation application state
    const [designationBasedAccredEnabled, setDesignationBasedAccredEnabled] = useState(false);
    const [designationBasedAccredValue, setDesignationBasedAccredValue] = useState('');

    // Search (participants)
    const [searchTerm, setSearchTerm] = useState('');

    // Search (events) — server-side search across all pages
    const [eventSearchTerm, setEventSearchTerm] = useState(
        filters?.search ?? '',
    );

    // Designation-based CPD
    const [designationBasedCpdEnabled, setDesignationBasedCpdEnabled] =
        useState(false);
    const [designationBasedCpdValue, setDesignationBasedCpdValue] =
        useState('0');

    // Keep input in sync with server filter on pagination/back/forward
    useEffect(() => {
        setEventSearchTerm(filters?.search ?? '');
    }, [filters?.search]);

    // Debounced navigation is driven ONLY by typing (not effects).
    const searchTimerRef = useRef<number | null>(null);

    const runServerSearch = useCallback((nextSearch: string) => {
        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = window.setTimeout(() => {
            router.get(
                route('certificates.index'),
                { search: nextSearch || undefined },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['events', 'filters'],
                },
            );
        }, 350);
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current)
                window.clearTimeout(searchTimerRef.current);
        };
    }, []);

    const addTopic = () => {
        const currentTopics = getTopicsForCertificate();
        if (currentTopics.length >= MAX_TOPICS) {
            toast.error(`Maximum ${MAX_TOPICS} topics allowed`);
            return;
        }
        setCustomTopics((prev) => [...prev, '']);
    };

    const removeTopic = (index: number) =>
        setCustomTopics((prev) => prev.filter((_, i) => i !== index));

    const updateTopic = (index: number, value: string) => {
        setCustomTopics((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const toggleModule = (module: EHRModule) => {
        const currentTopics = getTopicsForCertificate();
        const isSelected = selectedModules.includes(module);

        if (!isSelected && currentTopics.length >= MAX_TOPICS) {
            toast.error(`Maximum ${MAX_TOPICS} topics allowed`);
            return;
        }

        setSelectedModules((prev) =>
            prev.includes(module)
                ? prev.filter((item) => item !== module)
                : [...prev, module],
        );
    };

    const toggleSelectAll = () => {
        const allSelected = selectedModules.length === EHR_OPTIONS.length;

        if (!allSelected && EHR_OPTIONS.length > MAX_TOPICS) {
            toast.error(`Maximum ${MAX_TOPICS} topics allowed`);
            return;
        }

        setSelectedModules(
            allSelected
                ? []
                : [...EHR_OPTIONS],
        );
    };

    const getTopicsForCertificate = () => {
        const custom = customTopics.map((t) => t.trim()).filter(Boolean);
        const merged = [...selectedModules, ...custom];
        return Array.from(new Set(merged));
    };

    const bulkSetCpdForParticipants = (participants: any[], value: string) => {
        setCpdValues((prev) => {
            const next = { ...prev };
            for (const p of participants) {
                next[p.id] = value;
            }
            return next;
        });
    };

    // ---- NEW: Bulk set accred code function ----
    const bulkSetAccredForParticipants = (participants: any[], value: string) => {
        setAccredValues((prev) => {
            const next = { ...prev };
            for (const p of participants) {
                // Only assign to CPD participants
                if (p.cpd && p.cpd !== 0) {
                    next[p.id] = value;
                }
            }
            return next;
        });
    };

    const handleRowClick = async (event: any) => {
        setOpen(true);
        setLoading(true);
        setClusteSort('all');
        setDropdownShown(false);
        setDesignation([]);
        setDesignationSort('all');
        setSearchTerm('');
        setDesignationBasedCpdEnabled(false);
        setDesignationBasedCpdValue('0');
        setAccredValues({});
        setDesignationBasedAccredEnabled(false);
        setDesignationBasedAccredValue('');

        setEventInfo((prev: any) => ({
            ...prev,
            ...event,
            participants: [],
            clusters: [],
        }));

        try {
            const response = await fetch(
                `/certificates/get-participants/${event.id}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok)
                throw new Error(`Server error: ${response.status}`);
            const data = await response.json();

            setEventInfo((prev: any) => ({
                ...prev,
                ...data,
                id: data.id ?? prev.id,
                name: data.name ?? prev.name,
                type: data.type ?? prev.type,
                participants: Array.isArray(data.participants)
                    ? data.participants
                    : [],
                clusters: data.clusters || [],
            }));

            for (const participant of data.participants || []) {
                setDesignation((prev) => [...prev, participant.designation]);
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            toast.error('Failed to load participants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = (participant: any, index: number) => {
        const cpdValForUser = cpdValues[participant.id] || '0';
        const accredValForUser = accredValues[participant.id] || '';

        if (
            participant.cpd == 1 &&
            (cpdValForUser === undefined ||
                cpdValForUser === '' ||
                cpdValForUser === '0' ||
                cpdValForUser === '0.0')
        ) {
            toast.error(
                'Please provide a CPD code for this participant before sending email.',
            );
            return;
        }
        // Require accred code for CPD
        if (participant.cpd == 1 && (!accredValForUser || accredValForUser.length < 17)) {
            toast.error('Valid 17-character or more MDW Accred code required for this participant.');
            return;
        }

        const topicsSource = getTopicsForCertificate();
        const topicsParam = encodeURIComponent(JSON.stringify(topicsSource));

        const isWahForUser = !!includeWAHSignatories[participant.id];
        console.log("eventInfo:", eventInfo);
        window.open(
            `/certificates/${participant.id}/${eventInfo.id}?cpd=${isCPD}&cpd_code=${cpdValForUser}&index=${index}&topics=${topicsParam}&accred_code=${encodeURIComponent(accredValForUser)}${isWahForUser ? '&include_wah_signatories=true' : ''}`,
            '_blank',
        );
    };

    const handleSendEmail = async (participant: any, index: number) => {
        const cpdValForUser = cpdValues[participant.id] || '0';
        const accredValForUser = accredValues[participant.id] || '';

        if (
            participant.cpd == 1 &&
            (cpdValForUser === undefined ||
                cpdValForUser === '' ||
                cpdValForUser === '0' ||
                cpdValForUser === '0.0')
        ) {
            toast.error(
                'Please provide a CPD code for this participant before sending email.',
            );
            return;
        }

        // Require accred code for CPD
        if (participant.cpd == 1 && (!accredValForUser || accredValForUser.length < 17)) {
            toast.error('Valid 17-character or more MDW Accred code required for this participant.');
            return;
        }

        try {
            setSendingId(participant.id);

            const topicsSource = getTopicsForCertificate();
            const isWahForUser = !!includeWAHSignatories[participant.id];

            const eventData = eventInfo;

            let asignatories = null;
            let position = null;

            if (eventData.type === 'Cluster') {
                if (participant?.cluster?.require_signatory == 1) {
                    asignatories = participant?.cluster.signatory;
                    position = participant?.cluster.position;
                } else {
                    asignatories = null;
                    position = null;
                }
            } else {
                asignatories = eventData.leader;
                position = eventData.position;
            }

            const resolvedLogo =
                eventData?.type === 'Cluster'
                    ? participant?.cluster_logo
                    : eventData?.logo;

            const resolvedLogoBase64 =
                eventData?.type === 'Cluster'
                    ? participant?.cluster_logo_base64
                    : eventData?.logoBase64;
            
            const doc = (
                <MedTechCertPdfDocument
                    data={participant}
                    eventData={eventData}
                    region={eventData.event_region?.name}
                    province={eventData.event_province?.name}
                    municipality={eventData.event_municipality?.name}
                    barangay={eventData.event_barangay?.name}
                    isCPD={participant.cpd == 1 ? true : false}
                    cpdCode={cpdValForUser}
                    totalHours={eventData.required_hours}
                    participantHoursAttended={participant.total_hours_attended}
                    isCompleted={
                        participant.total_hours_attended >=
                        eventData?.required_hours
                    }
                    index={index}
                    selectedTopics={topicsSource}
                    accreditationCode={accredValForUser}
                    includeWAHSignatories={isWahForUser}
                    logo={resolvedLogo}
                    logoBase64={resolvedLogoBase64}
                    assetBaseUrl={window.location.origin}
                    signatory={asignatories}
                    position={position}
                />
            );

            const blob = await pdf(doc).toBlob();
            const filename = `Certificate-26-${eventData?.fac_id ?? 'FAC'}-${participant.id}.pdf`;

            const form = new FormData();
            form.append('participant_id', String(participant.id));
            form.append('event_id', String(eventInfo.id));
            form.append(
                'certificate_pdf',
                new File([blob], filename, { type: 'application/pdf' }),
            );
            form.append('index', String(index));

            await axios.post('/certificates/email-upload', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                timeout: 120000,
            });

            toast.success(
                `Email sent to ${participant.first_name} ${participant.last_name}.`,
            );
        } catch (e: any) {
            console.error('Email send failed:', e?.response?.data ?? e);
            toast.error(e?.response?.data?.message ?? 'Failed to send email.');
        } finally {
            setSendingId(null);
        }
    };

    const handleDownloadCertificate = async (participant: any, index: number) => {
        const cpdValForUser = cpdValues[participant.id] || '0';
        const accredValForUser = accredValues[participant.id] || '';

        if (
            participant.cpd == 1 &&
            (cpdValForUser === undefined ||
                cpdValForUser === '' ||
                cpdValForUser === '0' ||
                cpdValForUser === '0.0')
        ) {
            toast.error(
                'Please provide a CPD code for this participant before downloading.',
            );
            return;
        }
        // Require accred code for CPD
        if (
            participant.cpd == 1 &&
            (!accredValForUser || accredValForUser.length < 17)
        ) {
            toast.error('Valid 17-character or more MDW Accred code required for this participant.');
            return;
        }

        try {
            setDownloadingId(participant.id);

            const topicsSource = getTopicsForCertificate();
            const isWahForUser = !!includeWAHSignatories[participant.id];

            const eventData = eventInfo;

            let asignatories = null;
            let position = null;

            if (eventData.type === 'Cluster') {
                if (participant?.cluster?.require_signatory == 1) {
                    asignatories = participant?.cluster.signatory;
                    position = participant?.cluster.position;
                } else {
                    asignatories = null;
                    position = null;
                }
            } else {
                asignatories = eventData.leader;
                position = eventData.position;
            }

            const resolvedLogo =
                eventData?.type === 'Cluster'
                    ? participant?.cluster_logo
                    : eventData?.logo;

            const resolvedLogoBase64 =
                eventData?.type === 'Cluster'
                    ? participant?.cluster_logo_base64
                    : eventData?.logoBase64;
      
            const doc = (
                <MedTechCertPdfDocument
                    data={participant}
                    eventData={eventData}
                    region={eventData.event_region?.name}
                    province={eventData.event_province?.name}
                    municipality={eventData.event_municipality?.name}
                    barangay={eventData.event_barangay?.name}
                    isCPD={participant.cpd == 1 ? true : false}
                    cpdCode={cpdValForUser}
                    totalHours={eventData.required_hours}
                    participantHoursAttended={participant.total_hours_attended}
                    isCompleted={
                        participant.total_hours_attended >=
                        eventData?.required_hours
                    }
                    index={index}
                    selectedTopics={topicsSource}
                    accreditationCode={accredValForUser}
                    includeWAHSignatories={isWahForUser}
                    logo={resolvedLogo}
                    logoBase64={resolvedLogoBase64}
                    assetBaseUrl={window.location.origin}
                    signatory={asignatories}
                    position={position}
                />
            );

            const blob = await pdf(doc).toBlob();
            const filename = `Certificate-26-${eventData?.fac_id ?? 'FAC'}-${participant.id}.pdf`;
            await downloadBlob(blob, filename);

            toast.success(
                `PDF downloaded for ${participant.first_name} ${participant.last_name}.`,
            );
        } catch (e) {
            console.error('Download failed:', e);
            toast.error('Failed to download PDF.');
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredParticipants = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return (eventInfo.participants || []).filter((p: any) => {
            const matchesCluster =
                eventInfo.type !== 'Cluster' ||
                clusteSort === 'all' ||
                p.pivot?.cluster_id?.toString() === clusteSort;

            const matchesDesignation =
                designationSort === 'all' || p.designation === designationSort;

            const fullName = `${p.first_name ?? ''} ${p.last_name ?? ''}`
                .trim()
                .toLowerCase();
            const matchesName =
                term.length === 0 ||
                fullName.includes(term) ||
                (p.first_name ?? '').toLowerCase().includes(term) ||
                (p.last_name ?? '').toLowerCase().includes(term);

            return matchesCluster && matchesDesignation && matchesName;
        });
    }, [
        eventInfo.participants,
        eventInfo.type,
        clusteSort,
        designationSort,
        searchTerm,
    ]);

    const participantIdToOriginalIndex = useMemo(() => {
        const map: Record<number, number> = {};
        (eventInfo.participants || []).forEach((p: any, i: number) => {
            if (p.id !== undefined) map[p.id] = i;
        });
        return map;
    }, [eventInfo.participants]);

    useEffect(() => {
        setDesignationBasedCpdValue('0');
    }, [designationSort]);

    useEffect(() => {
        setDesignationBasedAccredValue('');
    }, [designationSort]);

    const uniqueDesignations = Array.from(
        new Set((eventInfo.participants || []).map((p: any) => p.designation)),
    )
        .filter(Boolean)
        .sort();

    const list = events?.data ?? [];

    const [modalOpen, setModalOpen] = useState(false);
    const [clusters, setClusters] = useState<any[]>([]);

    const handleOpenModal = (event: any) => {
        setClusters(event.clusters ?? []);
        setModalOpen(true);
    };

    const currentTopicsCount = getTopicsForCertificate().length;
    const topicsLimitReached = currentTopicsCount >= MAX_TOPICS;

    return (
        <AppLayout>
            <Head title="Certificates" />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex h-[95%] min-w-[85%] flex-col overflow-hidden">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-black text-foreground">
                            <span className="text-primary">{eventInfo.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Configure certificate details and select participants.
                        </DialogDescription>

                        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-left">
                            {/* --- COLUMN 1: CPD/Bulk controls and Topics --- */}
                            <div className="space-y-4">

                                {/* ----------- CPD and Accred bulk controls ---------------- */}

                                {eventInfo.doesHaveCPD ? (
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                                        <Label className="block text-[13px] font-bold uppercase mb-2 text-primary">CPD / BULK Settings</Label>

                                        {/* Bulk Accred Code */}
                                        {designationSort !== 'all' && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 pb-1">
                                                    <Label className="text-muted-foreground" htmlFor="designationBasedAccredToggle">
                                                        Designation Based Accred. Code
                                                    </Label>
                                                    <Switch
                                                        id="designationBasedAccredToggle"
                                                        checked={designationBasedAccredEnabled}
                                                        onCheckedChange={setDesignationBasedAccredEnabled}
                                                        className="data-[state=checked]:bg-[#017d62] cursor:pointer border-2 border-gray-400"
                                                    />
                                                </div>
                                                <div className={`${designationBasedAccredEnabled ? 'flex items-center gap-2 h-[2rem]' : 'h-0'} transition-all transition-duration-300 overflow-hidden`}>
                                                    <Label className="text-muted-foreground" htmlFor="groupAccred">Value:</Label>
                                                    <input
                                                        type="text"
                                                        id="groupAccred"
                                                        value={designationBasedAccredValue}
                                                        onChange={e => {
                                                            const input = e.target.value.replace(/^MDW-/, '');
                                                            const digits = input.replace(/\D/g, '');

                                                            let pattern = '';
                                                            if (digits.length > 0) {
                                                                pattern += digits.substring(0, 4);
                                                                if (digits.length > 4) pattern += '-' + digits.substring(4, 7);
                                                                if (digits.length > 7) pattern += '-' + digits.substring(7, 11);
                                                            }
                                                            setDesignationBasedAccredValue(pattern ? `MDW-${pattern}` : '');
                                                        }}
                                                        placeholder="MDW-XXXX-XXX-XXXX"
                                                        disabled={!designationBasedAccredEnabled}
                                                        className="h-8 w-48 rounded-md border border-input bg-background px-2 text-xs text-foreground font-mono"
                                                        maxLength={17}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            !designationBasedAccredEnabled ||
                                                            designationSort === 'all' ||
                                                            designationBasedAccredValue === ''
                                                        }
                                                        onClick={() =>
                                                            bulkSetAccredForParticipants(
                                                                filteredParticipants,
                                                                designationBasedAccredValue,
                                                            )
                                                        }
                                                    >
                                                        Apply to filtered
                                                    </Button>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Applies to filtered participants (current designation). You can still edit each participant afterwards.
                                                </p>
                                            </div>
                                        )}

                                        {/* Bulk CPD Code */}
                                        {designationSort !== 'all' && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-muted-foreground" htmlFor="designationBasedCpdToggle">
                                                        Designation Based CPD
                                                    </Label>
                                                    <Switch
                                                        id="designationBasedCpdToggle"
                                                        checked={designationBasedCpdEnabled}
                                                        onCheckedChange={setDesignationBasedCpdEnabled}
                                                        disabled={!isCPD}
                                                        className="data-[state=checked]:bg-[#46017d] cursor:pointer border-2 border-gray-400"
                                                    />
                                                </div>
                                                <div className={`${designationBasedCpdEnabled ? 'flex items-center gap-2 h-[2rem]' : 'h-0'} transition-all transition-duration-300 overflow-hidden`}>
                                                    <Label className="text-muted-foreground" htmlFor="groupCpd">Value:</Label>
                                                    <input
                                                        type="text"
                                                        id="groupCpd"
                                                        value={designationBasedCpdValue}
                                                        onChange={(e) =>
                                                            setDesignationBasedCpdValue(e.target.value)
                                                        }
                                                        disabled={!isCPD || !designationBasedCpdEnabled}
                                                        className="h-8 w-24 rounded-md border border-input bg-background px-2 text-xs text-foreground"
                                                        placeholder="CPD Code"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            !isCPD ||
                                                            !designationBasedCpdEnabled ||
                                                            designationSort === 'all' ||
                                                            designationBasedCpdValue === ''
                                                        }
                                                        onClick={() =>
                                                            bulkSetCpdForParticipants(
                                                                filteredParticipants,
                                                                designationBasedCpdValue,
                                                            )
                                                        }
                                                    >
                                                        Apply to filtered
                                                    </Button>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Applies to filtered participants (current designation). You can still edit each participant afterwards.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p className='text-red-500'>No CPD options available.</p>
                                    </>
                                )}

                                {/* --------- TOPICS SELECTION --------------- */}
                                <div className="rounded-lg border bg-muted/30 p-4 mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="block text-[13px] font-bold uppercase text-primary">
                                            Topics Selection
                                        </Label>
                                        <Badge
                                            variant={topicsLimitReached ? "destructive" : "secondary"}
                                            className="text-xs font-bold"
                                        >
                                            {currentTopicsCount}/{MAX_TOPICS}
                                        </Badge>
                                    </div>

                                    <div className="relative">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-10 w-full justify-between overflow-hidden border-2 text-xs"
                                            onClick={() => setDropdownShown(!isDropdownShown)}
                                        >
                                            <span className="truncate font-bold">
                                                {currentTopicsCount} Topics Selected
                                            </span>
                                            <span>
                                                {isDropdownShown ? '▲' : '▼'}
                                            </span>
                                        </Button>

                                        <AnimatePresence>
                                            {isDropdownShown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="absolute right-0 left-0 z-[100] mt-1 rounded-md border-2 bg-popover text-popover-foreground shadow-2xl"
                                                >
                                                    <div className="sticky top-0 flex items-center space-x-2 border-b border-border bg-muted p-2">
                                                        <Checkbox
                                                            id="all"
                                                            checked={selectedModules.length === EHR_OPTIONS.length}
                                                            onCheckedChange={toggleSelectAll}
                                                            disabled={topicsLimitReached && selectedModules.length !== EHR_OPTIONS.length}
                                                        />
                                                        <label
                                                            htmlFor="all"
                                                            className="cursor-pointer text-[10px] font-black"
                                                        >
                                                            SELECT ALL TOPICS
                                                        </label>
                                                    </div>
                                                    <div className="max-h-56 overflow-y-auto p-1">
                                                        {EHR_OPTIONS.map((opt) => (
                                                            <div
                                                                key={opt}
                                                                className="group flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent"
                                                            >
                                                                <Checkbox
                                                                    id={opt}
                                                                    checked={selectedModules.includes(opt)}
                                                                    onCheckedChange={() => toggleModule(opt)}
                                                                    disabled={topicsLimitReached && !selectedModules.includes(opt)}
                                                                />
                                                                <label
                                                                    htmlFor={opt}
                                                                    className="flex-1 cursor-pointer text-[11px] leading-tight group-hover:text-primary"
                                                                >
                                                                    {opt}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="max-h-[140px] space-y-2 overflow-y-auto rounded-md border border-dashed border-border bg-muted/40 p-2 mt-2">
                                        {customTopics.map((topic, index) => (
                                            <div key={index} className="flex items-center gap-1">
                                                <Input
                                                    placeholder="Enter additional topic..."
                                                    value={topic}
                                                    className="h-8 bg-background text-xs"
                                                    onChange={(e) =>
                                                        updateTopic(index, e.target.value)
                                                    }
                                                    disabled={topicsLimitReached && !topic}
                                                />
                                                <div className="flex">
                                                    {customTopics.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => removeTopic(index)}
                                                        >
                                                            <span className="text-lg">−</span>
                                                        </Button>
                                                    )}
                                                    {index === customTopics.length - 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:text-primary"
                                                            onClick={addTopic}
                                                            disabled={topicsLimitReached}
                                                            title={topicsLimitReached ? `Maximum ${MAX_TOPICS} topics reached` : 'Add topic'}
                                                        >
                                                            <span className="text-lg">+</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {topicsLimitReached && (
                                        <p className="text-[11px] text-destructive font-semibold mt-2">
                                            ⚠️ Maximum {MAX_TOPICS} topics reached. Remove some to add more.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* --- COLUMN 2: Filters --- */}
                            <div className="space-y-4">
                                {/* Cluster filter */}
                                <div className="flex flex-col gap-1">
                                    <Label className="ml-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                        {eventInfo.type === 'Cluster'
                                            ? 'Cluster Filter'
                                            : 'Configuration'}
                                    </Label>
                                    {eventInfo.type === 'Cluster' ? (
                                        <Select
                                            value={clusteSort}
                                            onValueChange={(value) => setClusteSort(value)}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="All Clusters" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Clusters
                                                </SelectItem>
                                                {eventInfo.clusters.map((cluster: any) => (
                                                    <SelectItem
                                                        key={cluster.id}
                                                        value={cluster.id.toString()}
                                                    >
                                                        {cluster.cluster_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-[11px] text-muted-foreground italic">
                                            Training Event Mode
                                        </div>
                                    )}
                                </div>

                                {/* Designation filter */}
                                <div className="flex flex-col gap-1">
                                    <Select
                                        value={designationSort}
                                        onValueChange={setDesignationSort}
                                    >
                                        <SelectTrigger className="h-10 w-full">
                                            <SelectValue placeholder="All Designations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Designations</SelectItem>
                                            {uniqueDesignations.map((item: any) => (
                                                <SelectItem
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Search */}
                                <div className="flex flex-col gap-1">
                                    <Label className="ml-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Search Participant
                                    </Label>
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Type first name or last name..."
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Participant Table */}
                    <div className="mt-4 flex-1 overflow-y-auto rounded-lg border bg-muted/20 shadow-inner">
                        <Table>
                            <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
                                <TableRow>
                                    <TableHead className="w-[80px]">
                                        ID
                                    </TableHead>
                                    <TableHead>Participant Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead className="w-45">
                                        CPD Units
                                    </TableHead>
                                    <TableHead className="w-[180px]">
                                        Accred Code
                                    </TableHead>
                                    <TableHead className="w-[160px]">
                                        WAH Signatory
                                    </TableHead>
                                    <TableHead className="px-6 text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-20 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                                <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                                                    Loading Records...
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredParticipants.length > 0 ? (
                                    filteredParticipants.map((participant: any) => {
                                        const originalIndex = participantIdToOriginalIndex[participant.id] ?? 0;
                                        return (
                                            <TableRow
                                                key={participant.id}
                                                className="border-b transition-colors last:border-0 hover:bg-accent/40"
                                            >
                                                <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                    {participant.id}
                                                </TableCell>
                                                <TableCell className="font-bold whitespace-nowrap text-foreground">
                                                    {participant.first_name}{' '}{participant.last_name}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground uppercase">
                                                    {participant.designation}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        placeholder="0.0"
                                                        value={cpdValues[participant.id] || ''}
                                                        onChange={(e) =>
                                                            setCpdValues((prev) => ({
                                                                ...prev,
                                                                [participant.id]: e.target.value,
                                                            }))
                                                        }
                                                        className={
                                                            participant.cpd == null || participant.cpd === 0
                                                                ? `hidden`
                                                                : `h-8 w-20 text-center font-bold`
                                                        }
                                                        disabled={!isCPD}
                                                    />
                                                    <p
                                                        className={
                                                            participant.cpd == null || participant.cpd === 0
                                                                ? `ml-2 text-xs text-muted-foreground text-red-800`
                                                                : `hidden`
                                                        }
                                                    >
                                                        NON CPD
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                   <Input
                                                        type="text"
                                                        placeholder="MDW-XXXX-XXX-XXXX"
                                                        value={accredValues[participant.id] ?? ''}
                                                        onChange={(e) => {
                                                            // Remove fixed 'MDW-' prefix from input if present
                                                            const input = e.target.value.replace(/^MDW-/, '');
                                                            // Only keep digits
                                                            const digits = input.replace(/\D/g, '');

                                                            let pattern = '';
                                                            if (digits.length > 0) {
                                                            // First 4 digits
                                                            pattern += digits.substring(0, 4);
                                                            // Next 3 digits if available
                                                            if (digits.length > 4)
                                                                pattern += '-' + digits.substring(4, 7);
                                                            // Remaining digits (at least 4, can be longer)
                                                            if (digits.length > 7)
                                                                pattern += '-' + digits.substring(7);
                                                            }

                                                            setAccredValues((prev) => ({
                                                            ...prev,
                                                            [participant.id]: pattern ? `MDW-${pattern}` : '',
                                                            }));
                                                        }}
                                                        maxLength={25} // Allow enough for MDW-XXXX-XXX-XXXX[extra digits]
                                                        className="h-8 w-48 font-mono"
                                                        disabled={participant.cpd == null || participant.cpd === 0}
                                                        />
                                                </TableCell>
                                                <TableCell>
                                                    {eventInfo.type === 'Cluster' && (!participant.cluster?.signatory)
                                                        ? <p className='text-red-500'>No signatory available</p>
                                                        : (
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    checked={!!includeWAHSignatories[participant.id]}
                                                                    onCheckedChange={() =>
                                                                        setIncludeWAHSignatories((prev) => ({
                                                                            ...prev,
                                                                            [participant.id]: !prev[participant.id],
                                                                        }))
                                                                    }
                                                                    className="data-[state=checked]:bg-emerald-500"
                                                                />
                                                                <Label className="text-[10px] font-black text-muted-foreground uppercase">
                                                                    Include
                                                                </Label>
                                                            </div>
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8"
                                                            >
                                                                <MoreHorizontalIcon />
                                                                <span className="sr-only">
                                                                    Open menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full justify-start"
                                                                    onClick={() =>
                                                                        handleGenerate(
                                                                            participant,
                                                                            originalIndex + 1,
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </Button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full justify-start"
                                                                    onClick={() =>
                                                                        handleSendEmail(
                                                                            participant,
                                                                            originalIndex + 1
                                                                        )
                                                                    }
                                                                    disabled={sendingId === participant.id}
                                                                >
                                                                    {sendingId === participant.id ? 'Sending...' : 'Send'}
                                                                </Button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full justify-start"
                                                                    onClick={() =>
                                                                        handleDownloadCertificate(
                                                                            participant,
                                                                            originalIndex + 1
                                                                        )
                                                                    }
                                                                    disabled={downloadingId === participant.id}
                                                                >
                                                                    {downloadingId === participant.id
                                                                        ? 'Preparing...'
                                                                        : <>Download</>
                                                                    }
                                                                </Button>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-20 text-center"
                                        >
                                            <Empty>
                                                <Lottie
                                                    loop
                                                    className="h-auto w-[20%]"
                                                    animationData={
                                                        errorAnimation
                                                    }
                                                />
                                                <EmptyHeader>
                                                    <EmptyDescription>
                                                        No result have been
                                                        found
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* ---------- BATCH DOWNLOAD BUTTON SECTION ----------- */}
                    <DialogFooter className="mt-4 border-t pt-4 justify-between flex-row gap-2">
                        <div className="flex-1">

                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost">Close Window</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Page Content */}
            <div className="flex flex-col p-10">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <Label className="text-2xl font-black md:text-3xl">
                                Certificates
                            </Label>
                        </div>
                        <CardDescription className="">
                            Manage, Generate and Send certificates for event
                            participants.
                        </CardDescription>
                    </CardHeader>

                    {/* Event search */}
                    <div className="w-full max-w-md">
                        <Label className="ml-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                            Search Event
                        </Label>
                        <Input
                            value={eventSearchTerm}
                            onChange={(e) => {
                                const next = e.target.value;
                                setEventSearchTerm(next);
                                runServerSearch(next);
                            }}
                            placeholder="Type event name or classification..."
                            className="h-10"
                        />
                    </div>
                </div>

                <Card className="mt-5 w-full overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-foreground">
                                    Events
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {list.length}
                                </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Click a row to configure certificates
                            </div>
                        </div>

                        {list.length > 0 ? (
                            <div className="max-h-[70vh] overflow-auto">
                                <Table className="w-full">
                                    <TableHeader className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[44%]">
                                                Event Name
                                            </TableHead>
                                            <TableHead className="w-[16%]">
                                                Type
                                            </TableHead>
                                            <TableHead>
                                                Facility
                                            </TableHead>
                                            <TableHead className="w-[20%]">
                                                Start Date
                                            </TableHead>
                                            <TableHead className="w-[20%]">
                                                End Date
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {list.map((event: any, idx: number) => (
                                            <TableRow
                                                key={event.id}
                                                className="cursor-pointer transition-colors hover:bg-accent/40"
                                                onClick={() =>
                                                    handleRowClick(event)
                                                }
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                                            {idx + 1}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div
                                                                className="truncate font-semibold text-foreground"
                                                                title={
                                                                    event.name
                                                                }
                                                            >
                                                                {event.name}
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-muted-foreground">
                                                                ID: {event.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-black tracking-wide text-muted-foreground uppercase">
                                                        {event.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {event.type === "Cluster" ? (
                                                        <Badge
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleOpenModal(event);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            Involved Facility
                                                        </Badge>
                                                    ) : (
                                                        <Badge>{event.type === 'Meeting' ? 'N/A' : event.facility}</Badge>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        event.start_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>

                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        event.end_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-8">
                                <Empty>
                                    <Lottie
                                        loop
                                        className="h-auto w-[20%]"
                                        animationData={errorAnimation}
                                    />
                                    <EmptyHeader>
                                        <EmptyDescription>
                                            No result have been found
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <InvolvedFacilitiesModal
                    clusters={clusters}
                    isFacilitiesIncludedModalShown={modalOpen}
                    toggleFacilitiesIncludedModal={setModalOpen}
                />

                <div className="mt-6">
                    <TablePagination links={events.links} />
                </div>
            </div>
        </AppLayout>
    );
};

export default Certificates;