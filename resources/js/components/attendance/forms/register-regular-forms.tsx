import { type InertiaFormProps } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { designations, gender, newSuffix } from '@/constants/constant';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import TermsAndConditions from '@/components/reusable/terms-and-conditions';
import usePageHandler from '@/hooks/usePageHandler';
import DataPrivacyModal from '@/components/reusable/data-privacy-modal';
import useBirthdayAge from '@/hooks/useBirthdayAge';
import { allowNameText, allowNumbersOnly } from '@/hooks/utils/textRestrictions';
import { Spinner } from '@/components/ui/spinner';

type RegisterClusterForms = {
    facility_name: string | undefined;
    event_type: EventTypeSelection;
    onChangeVal: (
        fieldName: keyof ParticipantType,
        value: string | number | boolean | null,
    ) => void;
    participantForm: InertiaFormProps<ParticipantType>;
    type?: 'Add' | 'Register';
};

const RegisterRegularForms = ({
    facility_name,
    event_type,
    participantForm,
    onChangeVal,
    type,
}: RegisterClusterForms) => {
    const {
        nextPage,
        prevPage,
        page,
        handleRegularSubmit,
        isFormRegularFormComplete,
    } = usePageHandler({
        event_type,
        participantForm,
        facility_name,
    });

    const [isTermsShown, toggleTerms] = useState<boolean>(false);
    const [isPrivacyShown, togglePrivacy] = useState(false);

    const { derivedAge } = useBirthdayAge({
        birthday: participantForm.data.birthday,
        onChangeVal,
    });

    // Middle name rule:
    // - allowed: "" (0 letters)
    // - allowed: length >= 2
    // - NOT allowed: length === 1
    const middleName = (participantForm.data.middle_initial ?? '').trim();
    const isMiddleNameInvalid = middleName.length === 1;

    // PRC License rule (when toggle is ON):
    // - must be exactly 7 digits
    const prcLicenseRaw = (participantForm.data.prc_license ?? '').trim();
    const isPrcLicenseValid = /^\d{7}$/.test(prcLicenseRaw);
    const isPrcInvalid = !!participantForm.data.cpd && !isPrcLicenseValid;

    // Block moving forward on page 1 if middle name is exactly 1 char
    const isNextDisabled = page !== 0 || isMiddleNameInvalid;

    // Block submit anywhere if middle name is exactly 1 char
    // and/or if PRC is toggled on but invalid
    const isSubmitDisabled =
        !isFormRegularFormComplete ||
        participantForm.processing ||
        isMiddleNameInvalid ||
        isPrcInvalid;

    return (
        <div
            className="no-scrollbar w-full space-y-5"
            onSubmitCapture={handleRegularSubmit}
        >
            {page + 1 === 1 && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="flex flex-col">
                            <Label htmlFor="first_name">
                                First Name
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Juan"
                                id="first_name"
                                name="first_name"
                                required
                                onChange={(e) =>
                                    onChangeVal(
                                        'first_name',
                                        allowNameText(e.target.value),
                                    )
                                }
                                value={participantForm.data.first_name || ''}
                                className="mt-2 w-full rounded border px-2 py-2 shadow-2xs"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="last_name">
                                Last Name
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Dela Cruz"
                                id="last_name"
                                name="last_name"
                                required
                                onChange={(e) =>
                                    onChangeVal(
                                        'last_name',
                                        allowNameText(e.target.value),
                                    )
                                }
                                value={participantForm.data.last_name || ''}
                                className="mt-2 w-full rounded border px-2 py-2 shadow-2xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col md:col-span-2 ">
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
                                    Middle name must be empty or at least 2 letters.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="suffix">Suffix</Label>
                            <Select
                                name="suffix"
                                value={participantForm.data.suffix ?? '__NONE__'}
                                onValueChange={(e) =>
                                    onChangeVal(
                                        'suffix',
                                        e === '__NONE__' ? null : e,
                                    )
                                }
                            >
                                <SelectTrigger className="mt-2 w-full truncate">
                                    <SelectValue placeholder="Select Suffix" />
                                </SelectTrigger>
                                <SelectContent>
                                    {newSuffix.map((item, index) => (
                                        <SelectItem key={index} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:col-span-2 lg:col-span-2">
                            <Label htmlFor="birthday">
                                Birthday <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                onChange={(e) =>
                                    onChangeVal('birthday', e.target.value)
                                }
                                type="date"
                                id="birthday"
                                name="birthday"
                                required
                                value={participantForm.data.birthday || ''}
                                className="mt-2 w-full rounded border px-2 py-2 shadow-2xs"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {derivedAge === ''
                                    ? 'Age will be calculated automatically.'
                                    : `Calculated age: ${derivedAge}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {page + 1 === 2 && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="flex flex-col">
                            <Label htmlFor="designation">
                                Designation <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                name="designation"
                                value={participantForm.data.designation || ''}
                                onValueChange={(e) =>
                                    onChangeVal('designation', e)
                                }
                            >
                                <SelectTrigger className="mt-2 w-full truncate">
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

                        <div className="flex flex-col">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                name="gender"
                                value={participantForm.data.gender || ''}
                                onValueChange={(e) => onChangeVal('gender', e)}
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
                    </div>

                    {event_type === 'Training' && (
                        <div className="flex flex-col">
                            <Label htmlFor="facility_name">
                                Facility{' '}
                                <span className="font-bold text-red-500">
                                    (Event under {event_type}. Cannot be edited)
                                </span>
                            </Label>
                            <Input
                                type="text"
                                readOnly
                                name="facility_name"
                                className="mt-2 w-full cursor-not-allowed rounded border px-2 py-2 shadow-2xs"
                                value={
                                    participantForm.data.facility_name ||
                                    facility_name ||
                                    ''
                                }
                                id="facility_name"
                            />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            onChange={(e) => onChangeVal('email', e.target.value)}
                            type="email"
                            placeholder="loremipsum@gmail.com"
                            value={participantForm.data.email || ''}
                            id="email"
                            name="email"
                            required
                            className="mt-2 w-full rounded border px-2 py-2 shadow-2xs"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="mobile_number">
                            Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            pattern="^(09|9)[0-9]{9}$"
                            placeholder="09"
                            id="mobile_number"
                            name="mobile_number"
                            onChange={(e) =>
                                onChangeVal(
                                    'mobile_number',
                                    allowNumbersOnly(e.target.value),
                                )
                            }
                            inputMode="numeric"
                            required
                            maxLength={11}
                            value={participantForm.data.mobile_number || ''}
                            className="mt-2 w-full rounded border px-2 py-2 shadow-2xs"
                        />

                        <FieldGroup className="mt-2 flex flex-row items-center gap-3">
                            <FieldLabel>PRC License</FieldLabel>
                            <Switch
                                checked={!!participantForm.data.cpd}
                                onCheckedChange={(e) => onChangeVal('cpd', e)}
                            />
                        </FieldGroup>
                    </div>

                    {participantForm.data.cpd && (
                        <FieldSet>
                            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="prc_license">
                                        PRC License Number
                                    </FieldLabel>
                                    <Input
                                        value={participantForm.data.prc_license || ''}
                                        id="prc_license"
                                        name="prc_license"
                                        inputMode="numeric"
                                        autoComplete="on"
                                        placeholder="7-digit PRC number"
                                        maxLength={7}
                                        pattern="^[0-9]{7}$"
                                        onChange={(e) => {
                                            // Strictly keep 7 digits only
                                            const digitsOnly = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 7);
                                            onChangeVal(
                                                'prc_license',
                                                digitsOnly,
                                            );
                                        }}
                                        className="w-full"
                                        required
                                    />
                                    {isPrcInvalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            PRC license number must be exactly 7
                                            digits.
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="expiry_date">
                                        Expiry Date
                                    </FieldLabel>
                                    <Input
                                        value={participantForm.data.expiry_date || ''}
                                        type="date"
                                        id="expiry_date"
                                        name="expiry_date"
                                        onChange={(e) =>
                                            onChangeVal(
                                                'expiry_date',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                        required
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    )}

                    {type === 'Register' && (
                        <div>
                            <div className="mb-2 flex items-start gap-3">
                                <Checkbox id="terms" required className="mt-1" />
                                <Label
                                    htmlFor="terms"
                                    className="cursor-pointer text-sm leading-relaxed"
                                >
                                    <button
                                        type="button"
                                        className="text-left"
                                        onClick={() =>
                                            toggleTerms((prev) => !prev)
                                        }
                                    >
                                        I agree to the Terms and Conditions
                                    </button>
                                </Label>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox id="privacy" required className="mt-1" />
                                <Label
                                    htmlFor="privacy"
                                    className="cursor-pointer text-sm leading-relaxed"
                                >
                                    <button
                                        type="button"
                                        className="text-left"
                                        onClick={() =>
                                            togglePrivacy((prev) => !prev)
                                        }
                                    >
                                        I have read the Privacy Policy
                                    </button>
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-2 pt-2">
                <div className="flex flex-col gap-3 sm:flex-row">
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
                        disabled={isNextDisabled}
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
                    className={`w-full transition-all ${
                        isFormRegularFormComplete && !isMiddleNameInvalid && !isPrcInvalid
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

export default RegisterRegularForms;