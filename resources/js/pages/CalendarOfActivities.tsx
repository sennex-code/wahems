import AppLayout from '@/layouts/app-layout';
import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, CalendarClock } from 'lucide-react';

import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
import { MoreHorizontal, Trash2, Pencil, Mail, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { Head } from '@inertiajs/react';
import { Label } from '@/components/ui/label';

const CalendarOfActivities = ({ activitiess }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editActivityId, setEditActivityId] = useState(null);

    const openEditDialog = (activity) => {
        setIsOpen(true); // open the dialog
        setIsEditing(true);
        setEditActivityId(activity.id);

        // populate form with activity data
        setFormData({
            event: activity.event,
            email: activity.email,
            start_time: activity.start_time,
            end_time: activity.end_time,
            startDate: new Date(activity.startDate),
            endDate: new Date(activity.endDate),
            status: activity.status,
        });

        setParticipantsList(activity.participants || []);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isOpen, setIsOpen] = useState(false);
    const [participantsList, setParticipantsList] = useState([]);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({
        event: undefined,
        email: undefined,
        startDate: undefined,
        endDate: undefined,
        status: undefined,
        participants: undefined,
    });
    const [currentParticipant, setCurrentParticipant] = useState<{
        name: string;
        email: string;
    }>({
        name: '',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);
    const [activities, setActivities] = useState([]);

    const [formData, setFormData] = useState({
        event: '',
        email: '',
        start_time: '',
        end_time: '',
        startDate: null,
        endDate: null,
        status: '',
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [searchTerms, setSearchTerms] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    };

    useEffect(() => {
        if (searchTerms.trim().length === 0) {
            setCurrentParticipant({ name: '', email: '' });
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            if (searchTerms.trim().length > 1) {
                axios
                    .get(`/api/search-users?term=${searchTerms}`)
                    .then((res) => {
                        setSuggestions(res.data);
                        setShowDropdown(true);
                    })
                    .catch((err) => console.error(err));
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerms]);

    const handleSelect = (user: { name: string; email: string }) => {
        setSearchTerms(user.name);
        setCurrentParticipant({ name: user.name, email: user.email });

        if (errors.email || errors.participants) {
            setErrors((prev) => ({
                ...prev,
                email: undefined,
                participants: undefined,
            }));
        }

        setShowDropdown(false);
    };

    const addParticipant = () => {
        const name = currentParticipant.name.trim();
        const email = currentParticipant.email.trim();

        if (!name || !email) {
            toast.success(
                'You need to provide an name and email before clicking the plus button.',
            );
            return;
        }

        const exists = participantsList.some(
            (p) => p.email.toLowerCase() === email.toLowerCase(),
        );

        if (exists) {
            toast.success('This email is already added.');
            return;
        }

        setParticipantsList([...participantsList, { name, email }]);

        setCurrentParticipant({ name: '', email: '' });
        setSearchTerms('');

        if (errors.participants) {
            setErrors((prev) => ({ ...prev, participants: '' }));
        }
    };

    const removeParticipant = (index) => {
        setParticipantsList(participantsList.filter((_, i) => i !== index));
    };

    const formatLocalDate = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateForm = () => {
        let valid = true;
        const newErrors: Record<string, string> = {};

        if (!formData.event) {
            newErrors.event = 'Event name is required';
            valid = false;
        }
        if (!formData.email) {
            newErrors.email = 'Event Email is required';
            valid = false;
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
            valid = false;
        }
        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
            valid = false;
        }

        if (
            formData.startDate &&
            formData.endDate &&
            formData.endDate < formData.startDate
        ) {
            newErrors.endDate = 'End date must be after start date';
            valid = false;
        }

        if (!formData.status) {
            newErrors.status = 'Please select a status';
            valid = false;
        }
        if (participantsList.length === 0) {
            newErrors.participants = 'At least one participant is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const payload = {
                event: formData.event,
                email: formData.email,
                startDate: formatLocalDate(formData.startDate),
                endDate: formatLocalDate(formData.endDate),
                start_time: formData.start_time, //  Add this
                end_time: formData.end_time,
                status: formData.status,
                participants: participantsList.map((p) => ({
                    name: p.name?.trim(),
                    email: p.email?.trim(),
                })),
            };

            let data;

            if (isEditing && editActivityId) {
                const response = await axios.put(
                    `/activities/${editActivityId}`,
                    payload,
                );
                data = response.data;

                if (data.success && data.activity) {
                    setActivities((prev) =>
                        prev.map((a) =>
                            a.id === editActivityId
                                ? {
                                      ...a,
                                      event: data.activity.event_name,
                                      email: data.activity.organizer_email,
                                      startDate: data.activity.start_date,
                                      endDate: data.activity.end_date,
                                      start_time:
                                          data.activity.start_time ||
                                          formData.start_time,
                                      end_time:
                                          data.activity.end_time ||
                                          formData.end_time,
                                      status: data.activity.status,
                                      participants:
                                          data.activity.participants ||
                                          participantsList,
                                  }
                                : a,
                        ),
                    );

                    toast.success('Event activity updated successfully');
                }
            } else {
                // CREATE new activity
                const response = await axios.post('/activities', payload);
                data = response.data;

                if (data.success && data.activity) {
                    const savedActivity = {
                        id: data.activity.id,
                        event: data.activity.event_name,
                        email: data.activity.organizer_email,
                        startDate: data.activity.start_date,
                        endDate: data.activity.end_date,
                        start_time:
                            data.activity.start_time || formData.start_time,
                        end_time: data.activity.end_time || formData.end_time,
                        status: data.activity.status,
                        createdAt: data.activity.created_at
                            ? new Date(data.activity.created_at)
                                  .toISOString()
                                  .split('T')[0]
                            : new Date().toISOString().split('T')[0],
                        participants:
                            data.activity.participants || participantsList,
                        googleEventId: data.activity.google_event_id || null,
                    };

                    setActivities((prev) => [savedActivity, ...prev]);

                    toast.success('Event activity created successfully');
                }
            }

            // Reset form & state after successful save
            setFormData({
                event: '',
                email: '',
                startDate: null,
                endDate: null,

                start_time: '', // Clear field
                end_time: '',
                status: '',
            });
            setParticipantsList([]);
            setCurrentParticipant({ name: '', email: '' });
            setIsOpen(false);
            setShowAddConfirm(false);
            setIsEditing(false);
            setEditActivityId(null);
        } catch (error: any) {
            console.error('Failed to save activity:', error);
            alert(
                error.response?.data?.message ||
                    'Failed to save activity. Check console.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteDialog = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await axios.delete(`/activities/${deleteId}`);

            if (response.data.success) {
                setActivities((prev) =>
                    prev.filter((activity) => activity.id !== deleteId),
                );
                toast.success('Event activity deleted successfully', {
                    description: 'Event activity deleted successfully.',
                });

                setDeleteId(null);
            }
        } catch (error) {
            console.error('Failed to delete activity:', error);
            alert('Could not delete the activity. Please try again.');
        } finally {
            setIsSubmitting(false);
            setDeleteId(null);
        }
    };

    const filteredActivities = useMemo(() => {
        return activities.filter((item: any) => {
            const matchesSearch =
                item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.participants.some(
                    (p: any) =>
                        p.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        p.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                );
            const matchesStatus =
                statusFilter === 'all' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, activities]);

    useEffect(() => {
        const normalized = activitiess.map((a: any) => ({
            id: a.id,
            event: a.event_name,
            email: a.organizer_email,
            startDate: a.start_date.split(' ')[0],
            endDate: a.end_date.split(' ')[0],
            status: a.status,
            createdAt: a.created_at ? a.created_at.split(' ')[0] : '',
            participants: Array.isArray(a.participants) ? a.participants : [],
            googleEventId: a.google_event_id || null,
        }));
        setActivities(normalized);
    }, [activitiess]);

    return (
        <AppLayout>
            <Head title="Activities"></Head>
            <CardHeader className="m-10 space-y-1">
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-6 w-6 text-primary" />
                    <Label className="text-2xl font-black md:text-3xl">
                        Calendar Of Activities
                    </Label>
                </div>
                <CardDescription className="">
                    Manage activities, review activities, and track their
                    current status.
                </CardDescription>
            </CardHeader>
            <Card className="mx-10">
                <CardHeader>
                    <div className="justify flex flex-col justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                            <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 dark:bg-green-900/30">
                                Synced with Google Sheets & Calendar
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:justify-end">
                            {' '}
                            <Input
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:max-w-[200px]"
                            />
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="Sure">Sure</SelectItem>
                                    <SelectItem value="Not Sure">
                                        Not Sure
                                    </SelectItem>
                                    <SelectItem value="Cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Dialog
                                open={isOpen}
                                onOpenChange={(open) => {
                                    setIsOpen(open);

                                    if (!open) {
                                        setFormData({
                                            event: '',
                                            email: '',
                                            startDate: null,
                                            start_time: '', // Reset here
                                            end_time: '',
                                            endDate: null,
                                            status: '',
                                        });
                                        setErrors({
                                            event: undefined,
                                            email: undefined,
                                            startDate: undefined,
                                            endDate: undefined,
                                            status: undefined,
                                            participants: undefined,
                                        });

                                        setParticipantsList([]);
                                        setCurrentParticipant({
                                            name: '',
                                            email: '',
                                        });
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" /> Create
                                        Activity
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <form onSubmit={handleSave}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {isEditing
                                                    ? 'Edit Activity'
                                                    : 'Create New Activity'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                Add event details and
                                                participants.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-1 py-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">
                                                    Event Name
                                                </label>
                                                <Input
                                                    placeholder="Event name"
                                                    required
                                                    value={formData.event}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            event: e.target
                                                                .value,
                                                        });
                                                        setErrors({
                                                            ...errors,
                                                            event: undefined,
                                                        });
                                                    }}
                                                    className={
                                                        errors.event
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                />
                                                {errors.event && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.event}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">
                                                    Event Email
                                                </label>
                                                <Input
                                                    placeholder="Email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            email: e.target
                                                                .value,
                                                        });
                                                        setErrors({
                                                            ...errors,
                                                            email: undefined,
                                                        });
                                                    }}
                                                    className={
                                                        errors.email
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Time Inputs: Side-by-side grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Start Time */}
                                                <div className="flex flex-col space-y-1.5">
                                                    <Label
                                                        htmlFor="start_time"
                                                        className="text-sm font-medium"
                                                    >
                                                        Start Time
                                                    </Label>
                                                    <Input
                                                        id="start_time"
                                                        name="start_time"
                                                        type="time"
                                                        value={
                                                            formData.start_time
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className={`w-full ${
                                                            errors.start_time
                                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                                : ''
                                                        }`}
                                                    />
                                                    {errors.start_time && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors.start_time}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* End Time */}
                                                <div className="flex flex-col space-y-1.5">
                                                    <Label
                                                        htmlFor="end_time"
                                                        className="text-sm font-medium"
                                                    >
                                                        End Time
                                                    </Label>
                                                    <Input
                                                        id="end_time"
                                                        name="end_time"
                                                        type="time"
                                                        value={
                                                            formData.end_time
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className={`w-full ${
                                                            errors.end_time
                                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                                : ''
                                                        }`}
                                                    />
                                                    {errors.end_time && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors.end_time}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">
                                                        Start Date
                                                    </label>

                                                    <Popover
                                                        open={openStart}
                                                        onOpenChange={
                                                            setOpenStart
                                                        }
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={
                                                                    errors.startDate
                                                                        ? '!border-red-500'
                                                                        : ''
                                                                }
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />

                                                                {formData.startDate
                                                                    ? format(
                                                                          formData.startDate,
                                                                          'MM/dd/yyyy',
                                                                      )
                                                                    : 'Pick a date'}
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    formData.startDate
                                                                }
                                                                disabled={(
                                                                    date,
                                                                ) =>
                                                                    date <
                                                                    new Date(
                                                                        new Date().setHours(
                                                                            0,
                                                                            0,
                                                                            0,
                                                                            0,
                                                                        ),
                                                                    )
                                                                }
                                                                onSelect={(
                                                                    date,
                                                                ) => {
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            startDate:
                                                                                date,
                                                                            endDate:
                                                                                formData.endDate &&
                                                                                formData.endDate <
                                                                                    date
                                                                                    ? null
                                                                                    : formData.endDate,
                                                                        },
                                                                    );

                                                                    setErrors({
                                                                        ...errors,
                                                                        startDate:
                                                                            undefined,
                                                                    });

                                                                    setOpenStart(
                                                                        false,
                                                                    );
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors.startDate && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors.startDate}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">
                                                        End Date
                                                    </label>

                                                    <Popover
                                                        open={openEnd}
                                                        onOpenChange={
                                                            setOpenEnd
                                                        }
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={
                                                                    errors.endDate
                                                                        ? '!border-red-500'
                                                                        : ''
                                                                }
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />

                                                                {formData.endDate
                                                                    ? format(
                                                                          formData.endDate,
                                                                          'MM/dd/yyyy',
                                                                      )
                                                                    : 'Pick a date'}
                                                            </Button>
                                                        </PopoverTrigger>

                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    formData.endDate
                                                                }
                                                                disabled={(
                                                                    date,
                                                                ) =>
                                                                    date <
                                                                    (formData.startDate ||
                                                                        new Date(
                                                                            new Date().setHours(
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                            ),
                                                                        ))
                                                                }
                                                                onSelect={(
                                                                    date,
                                                                ) => {
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            endDate:
                                                                                date,
                                                                        },
                                                                    );

                                                                    setErrors({
                                                                        ...errors,
                                                                        endDate:
                                                                            undefined,
                                                                    });

                                                                    setOpenEnd(
                                                                        false,
                                                                    );
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors.endDate && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors.endDate}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <hr />

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">
                                                    Initial Status
                                                </label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => {
                                                        setFormData({
                                                            ...formData,
                                                            status: value,
                                                        });
                                                        setErrors({
                                                            ...errors,
                                                            status: undefined,
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        className={`w-full border ${
                                                            errors.status
                                                                ? 'border-red-500'
                                                                : 'border-gray-300'
                                                        } rounded-md`}
                                                    >
                                                        <SelectValue placeholder="Select event status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sure">
                                                            <div className="flex items-center">
                                                                <span className="mr-2 flex h-2 w-2 rounded-full bg-primary" />
                                                                Approved
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Not Sure">
                                                            <div className="flex items-center">
                                                                <span className="mr-2 flex h-2 w-2 rounded-full bg-slate-400" />
                                                                Pending
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Cancelled">
                                                            <div className="flex items-center text-destructive">
                                                                <span className="mr-2 flex h-2 w-2 rounded-full bg-destructive" />
                                                                Cancelled
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.status}
                                                    </p>
                                                )}
                                            </div>

                                            <hr />

                                            <div
                                                className={`space-y-3 ${errors.participants ? 'rounded-md border border-red-500 p-2' : ''}`}
                                            >
                                                <label className="text-sm font-semibold">
                                                    Invite Participants
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            placeholder="Search Name..."
                                                            value={searchTerms}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;

                                                                setSearchTerms(
                                                                    value,
                                                                );

                                                                setCurrentParticipant(
                                                                    {
                                                                        ...currentParticipant,
                                                                        name: value,
                                                                    },
                                                                );

                                                                if (
                                                                    errors.participants
                                                                ) {
                                                                    setErrors(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            participants:
                                                                                '',
                                                                        }),
                                                                    );
                                                                }
                                                            }}
                                                            onFocus={() =>
                                                                suggestions.length >
                                                                    0 &&
                                                                setShowDropdown(
                                                                    true,
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                setTimeout(
                                                                    () =>
                                                                        setShowDropdown(
                                                                            false,
                                                                        ),
                                                                    200,
                                                                )
                                                            }
                                                        />

                                                        {showDropdown && (
                                                            <div className="absolute bottom-full z-50 mb-1 max-h-60 w-full animate-in overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl fade-in slide-in-from-bottom-2">
                                                                {suggestions.length >
                                                                0 ? (
                                                                    suggestions.map(
                                                                        (
                                                                            user,
                                                                            index,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="cursor-pointer border-b px-4 py-2 transition-colors last:border-0 hover:bg-slate-50"
                                                                                onClick={() =>
                                                                                    handleSelect(
                                                                                        user,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <p className="text-sm font-bold text-gray-800">
                                                                                    {
                                                                                        user.name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {
                                                                                        user.email
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                                                                        No users
                                                                        found...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Input
                                                        placeholder="Email"
                                                        value={
                                                            currentParticipant.email
                                                        }
                                                        className="flex-1"
                                                        onChange={(e) =>
                                                            setCurrentParticipant(
                                                                {
                                                                    ...currentParticipant,
                                                                    email: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                    />

                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={addParticipant}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {participantsList.length >
                                                    0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {participantsList.map(
                                                            (p, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="secondary"
                                                                    className="flex items-center gap-1 px-2 py-1"
                                                                >
                                                                    {p.name} (
                                                                    {p.email})
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeParticipant(
                                                                                index,
                                                                            )
                                                                        }
                                                                        className="ml-1"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                                {errors.participants && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.participants}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setFormData({
                                                        event: '',
                                                        email: '',

                                                        startDate: '',
                                                        endDate: '',
                                                        start_time: '',
                                                        end_time: '',

                                                        status: '',
                                                    });
                                                    setErrors({
                                                        event: undefined,
                                                        email: undefined,
                                                        startDate: undefined,
                                                        endDate: undefined,
                                                        status: undefined,
                                                        participants: undefined,
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => {
                                                    if (validateForm())
                                                        setShowAddConfirm(true);
                                                }}
                                            >
                                                {isEditing
                                                    ? 'Update Activity'
                                                    : 'Save Activity'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event Name</TableHead>
                                    <TableHead>Event Email</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Participants</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            No activities found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredActivities.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.event}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {item.email}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {formatDate(item.startDate)} to{' '}
                                                {formatDate(item.endDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Badge
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-slate-100"
                                                        >
                                                            {
                                                                item
                                                                    .participants
                                                                    .length
                                                            }{' '}
                                                            View
                                                        </Badge>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Participants:{' '}
                                                                {item.event}
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        <div className="space-y-2 py-4">
                                                            {item.participants.map(
                                                                (p) => (
                                                                    <div
                                                                        key={
                                                                            p.email
                                                                        }
                                                                        className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 dark:border-gray-700"
                                                                    >
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                {
                                                                                    p.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                {
                                                                                    p.email
                                                                                }
                                                                            </p>
                                                                        </div>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            asChild
                                                                        >
                                                                            <a
                                                                                href={`mailto:${p.email}`}
                                                                            >
                                                                                <Mail className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                                                            </a>
                                                                        </Button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.status === 'Sure'
                                                            ? 'default'
                                                            : item.status ===
                                                                'Cancelled'
                                                              ? 'destructive'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {item.status === 'Sure'
                                                        ? 'Approved'
                                                        : item.status ===
                                                            'Not Sure'
                                                          ? 'Pending'
                                                          : 'Cancelled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(item.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />{' '}
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Activity
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Dialog
                open={!!deleteId}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this activity? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isSubmitting}
                            onClick={confirmDelete}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete Activity'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
                <DialogContent className="sm:max-w-[300px]">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing
                                    ? 'Update Activity'
                                    : 'Create New Activity'}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? 'Make changes to the event details and participants.'
                                    : 'Do you want to add this event activity?'}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogHeader>
                    <form onSubmit={handleSave}>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddConfirm(false)}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEditing
                                            ? 'Updating...'
                                            : 'Creating...'}
                                    </span>
                                ) : isEditing ? (
                                    'Update Activity'
                                ) : (
                                    'Save Activity'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default CalendarOfActivities;
