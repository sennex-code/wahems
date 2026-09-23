import { Activity, ActivityIcon, LucideProps } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { MiniBadge } from './mini-badge';
import { ForwardRefExoticComponent } from 'react';

type HeaderProps = {
    length?: number;
    label: string;
    description: string;
    subHeader: boolean;
    subHeaderIcon?: ForwardRefExoticComponent<LucideProps>;
    mainIcon?: ForwardRefExoticComponent<LucideProps>;
};

export const Header = ({
    length,
    label,
    description,
    subHeader,
    subHeaderIcon,
    mainIcon,
}: HeaderProps) => {
    const SubIcon = subHeaderIcon;
    const MainIcon = mainIcon;
    return (
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {!subHeader && MainIcon && (
                        <MainIcon className="h-6 w-6 text-primary" />
                    )}

                    {subHeader && SubIcon ? (
                        <CardTitle className="flex items-center gap-2 text-base">
                            <SubIcon className="h-4 w-4 text-primary" />
                            {label}
                        </CardTitle>
                    ) : (
                        <Label className="text-2xl font-black md:text-3xl">
                            {label}
                        </Label>
                    )}
                </div>
                <CardDescription>{description}</CardDescription>
            </div>

            {typeof length === 'number' && length > 0 && (
                <MiniBadge>{length} recent items</MiniBadge>
            )}
        </CardHeader>
    );
};
