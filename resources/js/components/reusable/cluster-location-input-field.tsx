import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

// T can be any type
type ClusterLocationInputFieldsProps<T> = {
    id: number | string | null | undefined;
    label: string;
    disabled?: boolean;
    value: string | number | null;
    // <Select />  will always return value hence this
    valueChange: (value: string | number | boolean) => void;
    options: T[];
};

// Use standardType as basis for T
const ClusterLocationInputFields = <T extends StandardType>({
    id,
    label,
    value,
    valueChange,
    options,
    disabled = false,
}: ClusterLocationInputFieldsProps<T>) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={String(id)}>{label}</Label>
            <Select
                disabled={disabled}
                name={label}
                value={String(value) || ''}
                onValueChange={valueChange}
            >
                <SelectTrigger id={String(id)} className="w-full">
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option: T) => (
                        <SelectItem
                            key={option.psgc_10_digit_code}
                            value={option.psgc_10_digit_code}
                        >
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ClusterLocationInputFields;
