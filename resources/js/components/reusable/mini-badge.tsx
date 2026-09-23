import { ReactNode } from 'react';
type MiniBadgeProps = {
    children: ReactNode;
};

export const MiniBadge = ({ children }: MiniBadgeProps) => {
    return (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {children}
        </span>
    );
};
