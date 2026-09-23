// Event types

type EventTypeSelection = 'Training' | 'Meeting' | 'Cluster' | 'Workshop' | '';

type ClusterType = {
    id?: number | null;
    region: string;
    province: string;
    municipality: string;
    // barangay: string;
    cluster_name: string;
    facilities?: any[];
    logo: File | null;
    signatory: string | null;
    position: string | null;
    require_signatory: boolean;
};

type EventType = {
    id?: number;
    name: string;
    start_at: string;
    end_at: string;
    type: EventTypeSelection;
    clusters?: ClusterType[];
    region?: string;
    province?: string;
    municipality?: string;
    // barangay?: string;
    facility_code?: string;
    logo: File | null;
    address: string;
    leader: string;     
    position: string;
    user_id: number;

    exam_bank?: any;
    preExamisactive?: boolean;
    postExamisactive?: boolean;
    required_hours?: number;

    facilitator?:[];

    is_registration_active?: boolean;
     facilitator_id: number;
         facilitator_ids: number[];  
};

type EventListType = EventType & {
    id: number;
    facility: string;
    status?: string;
};

type ReturnedClusterType = {
    id: number;
    cluster_name: string;
    event_id: number;
    cluster_logo: string | null;
    region: string;
    province: string;
    municipality: string;
    // barangay: string;
    address: string;
    facilities?: FacilityType[] | undefined;
    created_at: string;
    updated_at: string;
    // ewan
    logo?: string;
};

type FacilityType = {
    id: number;
    code: string;
    short_code: string;
    facility_name: string;
    region_code: string;
    province_code: string;
    municipality_code: string;
    barangay_code: string;
};

type FacilitatorType = {
    id: number;
    name: string;
};

type EagerLoadedParticipantType = {
    age: number;
    created_at: string;
    designaation: string;
    email: string;
    // DIKO ALAM, PWEDE I REMOVE TO
    facility_name: string | null;
    first_name: string;
    last_name: string;
    middle_initial: string;
    gender: string;
    // PARTICIPANT ID
    id: number;
    mobile_number: string;
    suffix: string;
    updated_at: string;
};

type EventParticipantType = {
    attendace_code: string;
    attendances: AttendanceType[];
    cluster_id: number | null;
    event_id: number;
    facility_name: string | null;
    //   EVENT PARTICIPANT ID
    id: number;
    image_cert: string | null;
    participant: ParticipantType[];
    participant_id: number;
    registration_id: number;
    total_hours_attended: number;
    updated_at: string;
};
