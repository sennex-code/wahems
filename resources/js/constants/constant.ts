import {
    LucideIcon,
    User,
    Type,
    BadgeInfo,
    Calendar,
    VenusAndMars,
    Phone,
    Mail,
    Briefcase,
} from 'lucide-react';

export const eventType: string[] = [
    'Training',
    'Cluster',
    'Workshop',
    'Meeting',
] as const;
export const initialValue: EventType = {
    id: 0,
    name: '',
    start_at: '',
    end_at: '',
    type: '',
    clusters: [
        {
            region: '',
            province: '',
            municipality: '',
            // barangay: '',
            cluster_name: '',
            facilities: [],
            logo: null,
            position: '',
            signatory: '',
            require_signatory: false,
        },
    ],
    logo: null,
    province: '',
    region: '',
    municipality: '',

    facility_code: '',
    address: '',
    leader: '',
    position: '',
    'user_id': 0,
    facilitator_id: 0,
    facilitator_ids: [],
    
};

export const suffix = [
    'N/A',
    'Sr.',
    'Jr.',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
] as const;

export const newSuffix = [
    { label: 'N/A', value: '__NONE__' },
    { label: 'Sr.', value: 'Sr.' },
    { label: 'Jr.', value: 'Jr.' },
    { label: 'II', value: 'II' },
    { label: 'III', value: 'III' },
    { label: 'IV', value: 'IV' },
    { label: 'V', value: 'V' },
    { label: 'VI', value: 'VI' },
    { label: 'VII', value: 'VII' },
    { label: 'VIII', value: 'VIII' },
];

export const gender = ['Male', 'Female'] as const;

export const designations = [
    'Barangay Health Worker',
    'Clerk',
    'Dental Aide',
    'Dentist',
    'Encoder',
    'Lab Aide',
    'Physician',
    'Medical Technologist',
    'Municipal Social Welfare and Development Officer',
    'Midwife',
    'Nursing Attendant',
    'Nurse Deployment Program',
    'Nutritionists/Dietitians',
    'Public Health Assistant',
    'Pharmacist',
    'Radiologist',
    'Rural Health Midwives Placement Program',
    'Nurse',
    'Sanitary Engineers',
    'Sanitation Inspector',
    "Women and Children's Protection Desk Officer",
    'Facility Owner',
    'Admin Officer',
] as const;

export const choices = ['text', 'radio', 'multiple', 'rating'] as const;

export const personalDataCollectedWithIcons: {
    label: string;
    icon: LucideIcon;
}[] = [
    { label: 'First Name', icon: User },
    { label: 'Middle Initial', icon: Type },
    { label: 'Last Name', icon: User },
    { label: 'Suffix', icon: BadgeInfo },
    { label: 'Birthday', icon: Calendar },
    { label: 'Gender', icon: VenusAndMars },
    { label: 'Mobile Number', icon: Phone },
    { label: 'Email Address', icon: Mail },
    { label: 'Designation', icon: Briefcase },
] as const;

export const purposes = [
    'To help improve our data and services and customize user experience',
    'To deliver the products and services that you have requested',
    'To perform research and analysis about your use of, or interest in, our products, services, or content, or products, services, or content offered by others',
    'To provide better customer experience to the Provincial Government clients and improve, develop, identify, and implement services',
    'To follow safety, security, public service, or legal requirements and processes',
    'To process information for statistical, analytical, and research purposes',
    'To identify and prevent errors and inefficiencies due to misuse of the platform',
    'To enforce our terms and conditions',
] as const;

export const rights = [
    'Right of erasure or blocking. You may have a broader right to erasure of personal data that we hold about you.',
    'Right to object. You may have the right to request that we stop processing your personal data and/or to stop sending you marketing communications.',
    'Right to restrict processing. You may have the right to request that we restrict processing of your personal data in certain circumstances.',
    'Right to access. In certain circumstances, you may have the right to be provided with your personal data in a structured, machine-readable, and commonly used format and to request that we transfer the personal data to another data controller without hindrance.',
] as const;

export const dataProtectionOfficerDetails = [
    {
        label: 'Name',
        value: 'Kevin Greg Alvarado',
    },
    {
        label: 'Telephone',
        value: '(045) 985-5607',
    },
    {
        label: 'Email',
        value: 'Privacy@wah.ph',
    },
    {
        label: 'Address',
        value: '2nd Floor Diwa ng Tarlac Building, San Vicente, Tarlac City, 2300',
    },
] as const;

export const EVENT_TYPE_OPTIONS = [
    'All',
    'Training',
    'Workshop',
    'Meeting',
    'Cluster',
] as const;

export const STATUS_OPTIONS = [
    'All',
    'Upcoming',
    'Finished',
    'Ongoing',
] as const;

export const defaultFilters: FilterType = {
    search: '',
    filterBy: 'All',
    statusBy: 'All',
};
