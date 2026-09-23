export const toFullName = (p: {
    last_name: string;
    first_name: string;
    middle_initial: string;
    suffix: string;
}) => {
    const last = p?.last_name ?? '';
    const first = p?.first_name ?? '';
    const mi = p?.middle_initial ? ` ${p.middle_initial}.` : '';
    const suf = p?.suffix ? ` ${p.suffix}` : '';
    // example: "Dela Cruz, Juan P. Jr"
    return `${last}, ${first}${mi}${suf}`.trim();
};
