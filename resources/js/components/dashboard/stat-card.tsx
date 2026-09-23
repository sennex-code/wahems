import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';

export const StatCard = ({
    icon,
    label,
    value,
    iconWrapClass,
}: coundCardType) => {
    const Icon = icon;
    return (
        <Card key={label} className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base">{label}</CardTitle>
                        <CardDescription>
                            Summary for {label.toLowerCase()}.
                        </CardDescription>
                    </div>

                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${iconWrapClass}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5">
                <div className="text-3xl font-black tracking-tight text-foreground">
                    {value}
                </div>
            </CardContent>
        </Card>
    );
};
