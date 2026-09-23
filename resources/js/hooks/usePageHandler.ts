import { InertiaFormProps } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type usePageHandlerType = {
    participantForm: InertiaFormProps<ParticipantType>;
    event_type: EventTypeSelection;
    facility_name: string | undefined;
};

const MIN_AGE = 18;

function computeAgeFromBirthday(birthdayISO?: string): number | null {
    if (!birthdayISO) return null;
    // expects YYYY-MM-DD
    const parts = birthdayISO.split('-').map(Number);
    if (parts.length !== 3) return null;

    const [y, m, d] = parts;
    if (!y || !m || !d) return null;

    const birthDate = new Date(y, m - 1, d);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // if birthday hasn't occurred yet this year, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }

    return age < 0 ? null : age;
}

const usePageHandler = ({
    participantForm,
    event_type,
    facility_name,
}: usePageHandlerType) => {
    const [page, setPage] = useState<number>(0);

    // Checks if there are empty fields
    const isValid = (value: string | number | undefined | null) => {
        return !(
            value === undefined ||
            value === null ||
            value === '' ||
            value === 0
        );
    };

    // ----------------------------
    // PAGE 1
    // ----------------------------
    const pageOneFields = useMemo(
        () => ({
            first_name: participantForm.data.first_name,
            last_name: participantForm.data.last_name,

            birthday: participantForm.data.birthday,
        }),
        [
            participantForm.data.first_name,
            participantForm.data.last_name,

            participantForm.data.birthday,
        ],
    );

    const pageOneMissing = useMemo(
        () =>
            Object.entries(pageOneFields)
                .filter(([_, values]) => !isValid(values))
                .map((item) => item),
        [pageOneFields],
    );

    const computedAge = useMemo(
        () => computeAgeFromBirthday(participantForm.data.birthday),
        [participantForm.data.birthday],
    );

    const isAgeAllowed = computedAge !== null && computedAge >= MIN_AGE;

    // NOTE: page 1 is only valid if required fields are present AND age >= 21
    const isPageOneValid = pageOneMissing.length === 0 && isAgeAllowed;

    const nextPage = () => {
        // Only validate page 1 when trying to leave page 1
        if (page === 0) {
            // First: missing required fields
            if (pageOneMissing.length > 0) {
                console.log(pageOneMissing);
                toast.error(
                    `(${pageOneMissing.length}) required field/s are empty!`,
                );
                return;
            }

            // Then: age gate
            if (computedAge === null) {
                toast.error('Please enter a valid birthday.');
                return;
            }

            if (computedAge < MIN_AGE) {
                toast.error(`You must be ${MIN_AGE} or older to register.`);
                return;
            }
        }

        setPage((prev) => prev + 1);
    };

    const prevPage = () => {
        setPage((prev) => prev - 1);
    };

    // ----------------------------
    // PAGE 2 (CLUSTER)
    // ----------------------------
    const pageTwoClusterFields = useMemo(
        () => ({
            designation: participantForm.data.designation,
            cluster_id: participantForm.data.cluster_id,
            facility_name: participantForm.data.facility_name,
        }),
        [
            participantForm.data.designation,
            participantForm.data.cluster_id,
            participantForm.data.facility_name,
        ],
    );

    const pageTwoClusterMissing = useMemo(
        () =>
            Object.entries(pageTwoClusterFields)
                .filter(([_, values]) => !isValid(values))
                .map((item) => item),
        [pageTwoClusterFields],
    );

    const isPageTwoClusterValid = pageTwoClusterMissing.length === 0;
    const isFormClusterFormComplete = isPageOneValid && isPageTwoClusterValid;

    const handleClusterSubmit = (e: any) => {
        // Also enforce age gate on submit (defense-in-depth)
        if (!isAgeAllowed) {
            e.preventDefault();
            toast.error(`You must be ${MIN_AGE} or older to register.`);
            return;
        }

        if (!isFormClusterFormComplete) {
            e.preventDefault();
            toast.error(
                `(${pageTwoClusterMissing.length}) required field/s are empty!`,
                {
                    position: 'top-center',
                },
            );
        }
    };

    // ----------------------------
    // PAGE 2 (REGULAR)
    // ----------------------------
    const pageTwoRegularFields = useMemo(
        () => ({
            designation: participantForm.data.designation,
            gender: participantForm.data.gender,
            email: participantForm.data.email,
            mobile_number: participantForm.data.mobile_number,
            ...(event_type === 'Training'
                ? {
                      facility_name:
                          participantForm.data.facility_name || facility_name,
                  }
                : {}),
        }),
        [
            participantForm.data.designation,
            participantForm.data.gender,
            participantForm.data.email,
            participantForm.data.mobile_number,
            participantForm.data.facility_name,
            event_type,
            facility_name,
        ],
    );

    const pageTwoRegularMissing = useMemo(
        () =>
            Object.entries(pageTwoRegularFields)
                .filter(([_, values]) => !isValid(values))
                .map((item) => item),
        [pageTwoRegularFields],
    );

    const isPageTwoRegularValid = pageTwoRegularMissing.length === 0;
    const isFormRegularFormComplete = isPageOneValid && isPageTwoRegularValid;

    const handleRegularSubmit = (e: any) => {
        // Also enforce age gate on submit (defense-in-depth)
        if (!isAgeAllowed) {
            e.preventDefault();
            toast.error(`You must be ${MIN_AGE} or older to register.`);
            return;
        }

        if (!isFormRegularFormComplete) {
            e.preventDefault();
            toast.error(
                `(${pageTwoRegularMissing.length})  required field/s are empty!`,
                {
                    position: 'top-center',
                },
            );
        }
    };

    return {
        pageOneMissing,
        nextPage,
        prevPage,
        handleRegularSubmit,
        handleClusterSubmit,
        isFormRegularFormComplete,
        isFormClusterFormComplete,
        page,
    };
};

export default usePageHandler;
