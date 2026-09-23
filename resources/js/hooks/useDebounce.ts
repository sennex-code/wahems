import { useEffect, useState } from 'react';

export const useDebounce = (value: string | undefined, delay: 1000) => {
    const [debouncedValue, setDebounce] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounce(value);
        }, delay);

        return () => clearInterval(timer);
    }, [value, delay]);

    return debouncedValue;
};
