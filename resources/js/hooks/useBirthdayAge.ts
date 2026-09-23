import { useEffect, useMemo } from 'react';

type useBirthdayAgeProps = {
    birthday: string;
    onChangeVal: (fieldName: 'age', value: number) => void;
};
const useBirthdayAge = ({ birthday, onChangeVal }: useBirthdayAgeProps) => {
    const computedAgeFromBirthday = (birthdayISO: string): number | '' => {
        if (!birthdayISO) return '';
        // expects YYYY-MM-DD
        const parts = birthdayISO.split('-').map((p) => Number(p));
        if (parts.length !== 3) return '';

        const [y, m, d] = parts;
        if (!y || !m || !d) return '';

        const birthDate = new Date(y, m - 1, d);
        if (Number.isNaN(birthDate.getTime())) return '';

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // if birthday hasn't occurred yet this year, subtract 1
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age -= 1;
        }
        return age < 0 ? '' : age;
    };

    const derivedAge = useMemo(() => {
        console.log('Recomputing age from birthday:', birthday);
        return computedAgeFromBirthday(birthday);
    }, [birthday]);

    // Ensure `age` is always computed + included in the payload (no visible input)
    useEffect(() => {
        if (derivedAge === '') return;

        // only update if different to avoid extra renders
        if (Number(birthday) !== derivedAge) {
            onChangeVal('age', derivedAge);
        }
    }, [derivedAge]);

    return { derivedAge };
};

export default useBirthdayAge;
