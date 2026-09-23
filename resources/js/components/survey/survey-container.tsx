import {
    ChartColumnBig,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Home,
    QrCodeIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '../ui/button';
import { memo, useState } from 'react';
import InvolvedFacilitiesModal from '../event/involved-facilities-modal';

type SurveyContainerprops = {
    handleCreateEventNavigate: () => void;
    title: string;
    is_active: boolean;
    is_facilitator_active: boolean;
    hasFacilitatorSurvey: boolean;
    survey_id: number;
    event_id: number;
    facility: surveyEvent;
};

const SurveyContainer = ({
    title,
    handleCreateEventNavigate,
    is_active,
    is_facilitator_active,
    survey_id,
    event_id,
    facility,
    hasFacilitatorSurvey

}: SurveyContainerprops) => {
    const [involvedFacilities, toggleInvolvedFacilities] =
        useState<boolean>(false);
    // ✅ Add local state for switches
    const [localIsActive, setLocalIsActive] = useState(is_active);
    const [localIsFacilitatorActive, setLocalIsFacilitatorActive] = useState(is_facilitator_active);

    const handleSurveyToggle = (checked: boolean) => {
        setLocalIsActive(checked);
        router.patch(
            route('survey.update', {
                survey: survey_id,
            }),
            {
                is_active: checked,
            },
            {
                onSuccess: () => {
                    // ✅ Reload the page to get fresh data
                    router.visit(window.location.href);
                },
            }
        );
    };

    // ✅ New handler for facilitator survey
    const handleFacilitatorToggle = (checked: boolean) => {
        setLocalIsFacilitatorActive(checked);
        router.patch(
            route('survey.update', {
                survey: survey_id,
            }),
            {
                is_facilitator_active: checked,
            },
            {
                onSuccess: () => {
                    // ✅ Reload the page to get fresh data
                    router.visit(window.location.href);
                },
            }
        );
    };

    return (
        <Card className="group transition-shadow hover:shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                            <CardTitle className="text-base">
                                {title} 
                            </CardTitle>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <Badge
                                    variant={
                                        localIsActive ? 'default' : 'secondary'
                                    }
                                >
                                    {localIsActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge>{facility.type}</Badge>

                                {facility.facility && (
                                    <Badge variant="secondary">
                                        {facility.facility}
                                    </Badge>
                                )}

                                {facility?.clusters?.length > 0 && (
                                    <Badge
                                        onClick={() =>
                                            toggleInvolvedFacilities(
                                                (prev) => !prev,
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Home className="h-3.5 w-3.5" />
                                            <span className="text-[13px]">
                                                Involved facilities
                                            </span>
                                        </div>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                    <div>
                        <div className="text-sm font-medium">Event Evaluation Status</div>
                        <div className="text-xs text-muted-foreground">
                            Enable or disable this survey
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">
                            {localIsActive ? 'On' : 'Off'}
                        </Label>
                        <Switch
                            checked={localIsActive}
                            onCheckedChange={handleSurveyToggle}
                        />
                    </div>
                </div>

                {/* ✅ Facilitator Evaluation Switch */}
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                            {hasFacilitatorSurvey ? (<>
                              <div>
                        <div className="text-sm font-medium">Facilitator Evaluation Status</div>
                        <div className="text-xs text-muted-foreground">
                            Enable or disable facilitator evaluation
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">
                            {localIsFacilitatorActive ? 'On' : 'Off'}
                        </Label>
                        <Switch
                            checked={localIsFacilitatorActive}
                            onCheckedChange={handleFacilitatorToggle}
                        />
                    </div>
                            </>)
                            :<>
                                <p className='text-red-800 text-sm'>No Facilitators for this event(Old Events)</p>
                            </>}


                  
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        onClick={handleCreateEventNavigate}
                        className="flex-1 gap-2"
                        variant="outline"
                    >
                        QR Code
                        <QrCodeIcon className="h-4 w-4" />
                    </Button>

                    <Button asChild className="flex-1 gap-2">
                        <Link
                            href={route('survey.statistics', {
                                event: event_id,
                                survey: survey_id,
                            })}
                        >
                            Show Results
                            <ChartColumnBig className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                    Manage survey access and view evaluation results.
                </div>
            </CardContent>

            <InvolvedFacilitiesModal
                clusters={facility.clusters}
                isFacilitiesIncludedModalShown={involvedFacilities}
                toggleFacilitiesIncludedModal={toggleInvolvedFacilities}
            />
        </Card>
    );
};

export default memo(SurveyContainer);