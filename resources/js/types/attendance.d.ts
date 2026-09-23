type AttendanceType = {
    created_at: string;
    date_on: string;
    event_participants_id: string;

    // Boolean on database
    hasAttended: number;
    hours_attended: number;
    hours_attended_color_sceheme: string;
    id: number;
    updated_at: string;
};
type ViewModeType = 'Participant' | 'Graph';

type EventParticipantLoopType = {
    attendances: AttendanceType[];
    participant: {
        id: number;
        last_name: string;
        first_name: string;
        middle_initial: string;
    };
    facility_name: string;
};
