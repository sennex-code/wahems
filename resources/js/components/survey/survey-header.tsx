import { CalendarCheck2, ClipboardCheck } from 'lucide-react';
import { CardDescription, CardHeader } from '../ui/card';
import { Label } from '../ui/label';

const SurveyHeader = () => {
    return (
        <CardHeader className="flex flex-col gap-3 pb-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                    <Label className="text-2xl font-black md:text-3xl">
                        Survey
                    </Label>
                </div>
                <CardDescription>
                    View survey access, QR code, and participant results.
                </CardDescription>
            </div>
        </CardHeader>
    );
};

export default SurveyHeader;
