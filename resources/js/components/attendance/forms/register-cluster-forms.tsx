import type { InertiaFormProps } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { designations, gender, newSuffix } from '@/constants/constant';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import usePageHandler from '@/hooks/usePageHandler';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import TermsAndConditions from '@/components/reusable/terms-and-conditions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DataPrivacyModal from '@/components/reusable/data-privacy-modal';
import useBirthdayAge from '@/hooks/useBirthdayAge';
import {
    allowNameText,
    allowNumbersOnly,
} from '@/hooks/utils/textRestrictions';
import { Spinner } from '@/components/ui/spinner';

type RegisterClusterFormsType = {
    clusters: ReturnedClusterType[] | undefined;
    participantForm: InertiaFormProps<ParticipantType>;
    onChangeVal: (
        fieldName: keyof ParticipantType,
        value: string | number | boolean | null,
    ) => void;
    type?: 'Add' | 'Register';
};

const RegisterClusterForms = ({
    clusters,
    participantForm,
    onChangeVal,
    type,
}: RegisterClusterFormsType) => {
    const [selectedCluster, setSelectedCluster] =
        useState<ReturnedClusterType>();

    // Data privacy and terms and Conditions
    const [isTermsShown, toggleTerms] = useState(false);
    const [isPrivacyShown, togglePrivacy] = useState(false);

    // Use for editing, will select the cluster the user has selected before
    useEffect(() => {
        if (!participantForm.data.cluster_id) {
            setSelectedCluster(undefined);
            return;
        }

        const foundCluster = clusters?.find(
            (item) => item.id === Number(participantForm.data.cluster_id),
        );

        setSelectedCluster(foundCluster);
    }, [participantForm.data.cluster_id, clusters]);

    // Page handler, use for checking necessary fields before submitting
    const {
        nextPage,
        prevPage,
        page,
        handleClusterSubmit,
        isFormClusterFormComplete,
    } = usePageHandler({
        participantForm,
        event_type: 'Cluster',
        facility_name: '',
    });

    // Custom hook for computing age from birthday
    const { derivedAge } = useBirthdayAge({
        birthday: participantForm.data.birthday,
        onChangeVal: onChangeVal,
    });

    // MIDDLE NAME RULE:
    // allow empty (0 chars) OR at least 2 chars, but NOT exactly 1 char
    const middleName = (participantForm.data.middle_initial ?? '').trim();
    const isMiddleNameInvalid = middleName.length === 1;

    // PRC LICENSE RULE (only when PRC switch is ON):
    // must be exactly 7 digits
    const prcLicenseRaw = (participantForm.data.prc_license ?? '').trim();
    const isPrcLicenseValid = /^\d{7}$/.test(prcLicenseRaw);
    const isPrcInvalid = !!participantForm.data.cpd && !isPrcLicenseValid;

    // Disable submit when conditions are not met
    const isSubmitDisabled =
        !isFormClusterFormComplete ||
        participantForm.processing ||
        isMiddleNameInvalid ||
        isPrcInvalid;

    return (
        <div
            className="min-max-h-[50vh] -mx-4 flex flex-col gap-5 overflow-y-auto px-4"
            onSubmitCapture={handleClusterSubmit}
        >
            {page + 1 === 1 && (
                <div>
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="flex flex-col">
                            <Label htmlFor="first_name">
                                First Name{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Juan"
                                id="first_name"
                                name="first_name"
                                value={participantForm.data.first_name || ''}
                                onChange={(e) =>
                                    onChangeVal(
                                        'first_name',
                                        allowNameText(e.target.value),
                                    )
                                }
                                required
                                className="mt-2"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="last_name">
                                Last Name{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Dela Cruz"
                                id="last_name"
                                name="last_name"
                                value={participantForm.data.last_name || ''}
                                onChange={(e) =>
                                    onChangeVal(
                                        'last_name',
                                        allowNameText(e.target.value),
                                    )
                                }
                                required
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-4">
                        <div className="flex flex-col md:col-span-2">
                            <Label htmlFor="middle_initial">Middle Name</Label>
                            <Input
                                type="text"
                                placeholder="Dela Cruz"
                                id="middle_initial"
                                name="middle_initial"
                                value={participantForm.data.middle_initial || ''}
                                onChange={(e) =>
                                    onChangeVal(
                                        'middle_initial',
                                        allowNameText(e.target.value),
                                    )
                                }
                                className="mt-2"
                            />
                            {isMiddleNameInvalid && (
                                <p className="mt-1 text-xs text-red-500">
                                    Middle name must be empty or at least 2
                                    letters.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col md:col-span-1">
                            <Label htmlFor="suffix">Suffix</Label>
                            <Select
                                value={participantForm.data.suffix ?? '__NONE__'}
                                onValueChange={(value) =>
                                    onChangeVal(
                                        'suffix',
                                        value === '__NONE__' ? null : value,
                                    )
                                }
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue
                                        placeholder="Not Applicable"
                                        className="placeholder:truncate"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {newSuffix.map((item, index) => (
                                        <SelectItem
                                            key={index}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Birthday input (age computed + submitted) */}
                        <div className="flex flex-col md:col-span-2">
                            <Label htmlFor="birthday">
                                Birthday <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                id="birthday"
                                name="birthday"
                                value={participantForm.data.birthday || ''}
                                onChange={(e) =>
                                    onChangeVal('birthday', e.target.value)
                                }
                                required
                                className="mt-2"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {derivedAge === null
                                    ? 'Age will be calculated automatically.'
                                    : `Calculated age: ${derivedAge}`}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={participantForm.data.gender || ''}
                            onValueChange={(value) =>
                                onChangeVal('gender', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {gender.map((item, index) => (
                                    <SelectItem key={index} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-5 flex flex-col">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            placeholder="loremipsum@gmail.com"
                            id="email"
                            name="email"
                            value={participantForm.data.email || ''}
                            onChange={(e) =>
                                onChangeVal('email', e.target.value)
                            }
                            required
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-5">
                        <div className="flex flex-col">
                            <Label htmlFor="mobile_number">
                                Mobile Number{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="mobile_number"
                                name="mobile_number"
                                type="text"
                                inputMode="numeric"
                                pattern="^(09|9)[0-9]{9}$"
                                maxLength={11}
                                placeholder="09"
                                value={participantForm.data.mobile_number || ''}
                                onChange={(e) =>
                                    onChangeVal(
                                        'mobile_number',
                                        allowNumbersOnly(e.target.value),
                                    )
                                }
                                required
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>
            )}

            {page + 1 === 2 && (
                <div>
                    <div className="mt-5 flex flex-col">
                        <div className="flex flex-col">
                            <Label htmlFor="designation">
                                Designation{' '}
                                <span className="text-red-500">*</span>
                            </Label>

                            <Select
                                value={participantForm.data.designation || ''}
                                onValueChange={(value) =>
                                    onChangeVal('designation', value)
                                }
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="Select Designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map((item, index) => (
                                        <SelectItem key={index} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-5 w-full">
                            <Label htmlFor="cluster_id">
                                Cluster List{' '}
                                <span className="text-red-500">*</span>
                            </Label>

                            <Select
                                value={String(
                                    participantForm.data.cluster_id || '',
                                )}
                                onValueChange={(value) => {
                                    const foundCluster = clusters?.find(
                                        (cluster) =>
                                            cluster.id === Number(value),
                                    );

                                    setSelectedCluster(foundCluster);
                                    onChangeVal('cluster_id', value);
                                    onChangeVal('facility_name', '');
                                }}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="Select Cluster" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clusters?.map((cluster, index) => (
                                        <SelectItem
                                            key={index}
                                            value={String(cluster.id)}
                                        >
                                            {cluster.cluster_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col">
                        <Label htmlFor="facility_name">
                            Facilities <span className="text-red-500">*</span>
                        </Label>

                        <Select
                            value={participantForm.data.facility_name || ''}
                            onValueChange={(value) =>
                                onChangeVal('facility_name', value)
                            }
                        >
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select Facility" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedCluster?.facilities?.map(
                                    (facility: FacilityType, index) => (
                                        <SelectItem
                                            key={index}
                                            value={facility.facility_name}
                                        >
                                            {facility.facility_name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <FieldGroup className="mt-5 flex flex-row items-center gap-2">
                        <Switch
                            checked={!!participantForm.data.cpd}
                            onCheckedChange={(checked) =>
                                onChangeVal('cpd', checked)
                            }
                        />
                        <FieldLabel>PRC License</FieldLabel>
                    </FieldGroup>

                    {participantForm.data.cpd && (
                        <FieldSet className="mt-5">
                            <FieldGroup className="flex flex-col gap-4 md:flex-row">
                                <Field className="flex-1">
                                    <FieldLabel htmlFor="prc_license">
                                        PRC License Number
                                    </FieldLabel>
                                    <Input
                                        required
                                        id="prc_license"
                                        name="prc_license"
                                        placeholder="1234567"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        maxLength={7}
                                          pattern="^[0-9]{7}$"
                                        value={participantForm.data.prc_license || ''}
                                        onChange={(e) => {
                                            // Strict: keep digits only, clamp to 7
                                            const digitsOnly = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 7);

                                            onChangeVal('prc_license', digitsOnly);
                                        }}
                                    />
                                    {isPrcInvalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            PRC license number must be exactly 7
                                            digits.
                                        </p>
                                    )}
                                </Field>

                                <Field className="flex-1">
                                    <FieldLabel htmlFor="expiry_date">
                                        Expiry Date
                                    </FieldLabel>
                                    <Input
                                        required
                                        id="expiry_date"
                                        name="expiry_date"
                                        type="date"
                                        value={participantForm.data.expiry_date || ''}
                                        onChange={(e) =>
                                            onChangeVal(
                                                'expiry_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    )}

                    {type === 'Register' && (
                        <>
                            <div className="mt-5 flex gap-2">
                                <Checkbox id="terms" required />
                                <Label htmlFor="terms">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleTerms((prev) => !prev)
                                        }
                                    >
                                        I agree to the Terms and Conditions
                                    </button>
                                </Label>
                            </div>
                            <div className="mt-5 flex gap-2">
                                <Checkbox id="privacy" required />
                                <Label htmlFor="privacy">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            togglePrivacy((prev) => !prev)
                                        }
                                    >
                                        I have read the Privacy Policy
                                    </button>
                                </Label>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div>
                <div className="flex flex-row gap-5">
                    <Button
                        className="w-full"
                        type="button"
                        disabled={page === 0}
                        onClick={prevPage}
                    >
                        <ArrowLeft />
                        Previous
                    </Button>

                    <Button
                        type="button"
                        className="w-full"
                        disabled={page !== 0 || isMiddleNameInvalid}
                        onClick={nextPage}
                    >
                        Next
                        <ArrowRight />
                    </Button>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitDisabled}
                    className={`mt-2 w-full transition-all ${
                        isFormClusterFormComplete && !isMiddleNameInvalid && !isPrcInvalid
                            ? 'opacity-100 ring-2 ring-primary/30'
                            : 'cursor-not-allowed opacity-50'
                    }`}
                >
                    {participantForm.processing && <Spinner />}
                    <User />
                    Register
                </Button>
            </div>

            <DataPrivacyModal
                isDtsShown={isPrivacyShown}
                toggleDts={togglePrivacy}
            />
            <TermsAndConditions
                isTermsShown={isTermsShown}
                toggleTerms={toggleTerms}
            />
        </div>
    );
};

export default RegisterClusterForms;