import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

const useParticipantActions = () => {
    const [attendanceModal, toggleAttendanceModal] = useState<boolean>(false);
    const [participantAttendance, setParticipantAttendance] = useState<any>();

    // useStates for deletion of participants
    const [participantId, setParticipantId] = useState<number>();
    const [isDeleteParticipantShown, toggleDeleteModal] =
        useState<boolean>(false);

    const [attendanceCode, setAttendanceCode] = useState<string>();
    const [attendanceCodeModal, toggleAttendanceCodeModal] =
        useState<boolean>(false);

    // Adding of participant by facilitator
    const [isRegistrationModalShown, toggleRegistraionModal] =
        useState<boolean>(false);
    const [selectedParticipant, setSelectedParticipant] =
        useState<ParticipantType>();

    const handleEditClick = (participant: ParticipantType) => {
        setSelectedParticipant(participant);
        toggleRegistraionModal(true);
    };

    const closeEditModal = () => {
        setSelectedParticipant(undefined);
        toggleRegistraionModal(false);
    };

    // Toggles the attendance modal
    const openAttendance = (attendance: AttendanceType) => {
        setParticipantAttendance(attendance);
        toggleAttendanceModal(true);
    };
    const closeAttendance = () => {
        setParticipantAttendance(undefined);
        toggleAttendanceModal(false);
    };

    // Handles Deletion
    const handleDeleteParticipant = useCallback(() => {
        router.delete(
            route('event-participant.destroy', {
                eventParticipantId: Number(participantId),
            }),
            {
                onSuccess: () => {
                    toast.success('Event Deleted!');
                    toggleDeleteModal(false);
                },
            },
        );
    }, [participantId]);

    // Togles the deletion modal
    const deleteRequest = (participantId: number) => {
        setParticipantId(participantId);
        toggleDeleteModal(true);
    };
    const closeDeleteRequest = () => {
        setParticipantId(undefined);
        toggleDeleteModal(false);
    };

    // Toggles the attendanceCode/QR
    const openAttendanceCode = (attendanceCode: string) => {
        setAttendanceCode(attendanceCode);
        toggleAttendanceCodeModal(true);
    };

    const closeAttendanceCode = () => {
        setAttendanceCode(undefined);
        toggleAttendanceCodeModal(false);
    };
    return {
        // Attendance
        attendanceModal,
        participantAttendance,
        openAttendance,
        closeAttendance,

        // ParticipantDeletion
        handleDeleteParticipant,
        deleteRequest,
        closeDeleteRequest,
        isDeleteParticipantShown,

        // AttendanceCode
        openAttendanceCode,
        closeAttendanceCode,
        attendanceCode,
        attendanceCodeModal,

        // Edit of participant
        handleEditClick,
        closeEditModal,
        isRegistrationModalShown,
        selectedParticipant,

        toggleRegistraionModal,
    };
};

export default useParticipantActions;
