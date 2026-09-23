type StandardType = {
    code: string;
    created_at: string;
    id: number;
    name: string;
    population: number;
    psgc_10_digit_code: string;
    updated_at: string;
};

type RegionsType = StandardType;

type ProvinceType = StandardType & {
    region_id: string;
};

type MunicipalityType = StandardType & {
    province_id: string;
    geo_level: string;
    income_class: string;
};

type BarangayType = StandardType & {
    municipality_id: string;
    urab_rural: string;
};

type FacilityType = {
    id: number;
    code: string;
    facility_name: string;
};

type ParticipantType = {
    // PARTICIPANT ID
    id?: string;

    first_name: string;
    last_name: string;
    middle_initial: string;
    suffix: string | null;

    // NEW: store birthday, compute age from it (age still submitted)
    birthday: string; // YYYY-MM-DD
    age: number;

    designation: string;
    gender: string;
    email: string;

    // pick ONE facility_name definition (avoid duplicate)
    facility_name?: string;

    mobile_number: string;

    cpd?: boolean;
    prc_license?: string;
    expiry_date?: string;

    // for cluster assembly/Training type
    cluster_id?: string;
};
