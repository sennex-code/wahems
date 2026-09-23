import { ChangeEvent } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type ClusterNormalInputFieldProps = {
    id: number | string | undefined | null;
    label: string;
    handleCluster: (e: ChangeEvent<HTMLInputElement>) => void;
    defaultValue: string | number | boolean | undefined | null;
    placeHolder: string;
};

const ClusterNormalInputField = ({
    id,
    label,
    handleCluster,
    defaultValue,
    placeHolder,
}: ClusterNormalInputFieldProps) => {
    return (
        <div className="col-span-1 space-y-2 md:col-span-2">
            <Label htmlFor={String(id)}>{label}</Label>
            <Input
                id={String(id)}
                name={label}
                onChange={handleCluster}
                value={String(defaultValue) ?? ''}
                placeholder={placeHolder}
                required
            />
        </div>
    );
};

export default ClusterNormalInputField;
