import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast'; // Switched to react-hot-toast
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { store as login } from '@/routes/login';
import { form as register } from '@/routes/register';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import DataPrivacyModal from '@/components/reusable/data-privacy-modal';
import { removeEmojis } from '@/hooks/utils/textRestrictions';
import { useAppearance } from '@/hooks/use-appearance';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { motion } from 'motion/react';
import { Eye, EyeClosed, LockIcon, Mail, Moon, Sun, User } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status }: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    const [isDtsShown, toggleDts] = useState<boolean>(false);
    const [isPasswordShow, togglePassword] = useState<boolean>(true);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [isRegPasswordShow, setIsRegPasswordShow] = useState<boolean>(true);

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    const handleLoginError = (errors: any) => {
        if (errors.status_code === 'NOT_REGISTERED') {
            setStatusModal({
                isOpen: true,
                title: 'Account Not Found',
                message:
                    'This email is not registered in our system. Please create an account to proceed.',
            });
        } else if (errors.status_code === 'Pending') {
            setStatusModal({
                isOpen: true,
                title: 'Account Pending',
                message:
                    'Your registration is still being reviewed. Access will be granted once an admin approves your account.',
            });
        } else if (errors.status_code === 'Revoked') {
            setStatusModal({
                isOpen: true,
                title: 'Access Revoked',
                message:
                    'Your account access has been revoked. Please contact admin for assistance.',
            });
        }
    };

    return (
        <>
            <Dialog
                open={statusModal.isOpen}
                onOpenChange={(open) =>
                    setStatusModal((prev) => ({ ...prev, isOpen: open }))
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{statusModal.title}</DialogTitle>
                        <DialogDescription className="pt-4 text-base">
                            {statusModal.message}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={() =>
                                setStatusModal((prev) => ({
                                    ...prev,
                                    isOpen: false,
                                }))
                            }
                        >
                            Understood
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {isDtsShown && (
                <DataPrivacyModal
                    toggleDts={toggleDts}
                    isDtsShown={isDtsShown}
                />
            )}

            <Head title={isRegistering ? 'Register' : 'Login'} />

            <div className="relative flex max-h-screen min-h-screen w-screen overflow-hidden bg-linear-to-br px-3">
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                    <Switch
                        id="toggle-appearance"
                        checked={isDark}
                        onCheckedChange={(checked) =>
                            updateAppearance(checked ? 'dark' : 'light')
                        }
                    />
                    <Label
                        htmlFor="toggle-appearance"
                        className="cursor-pointer"
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Label>
                </div>

                <div className="my-auto flex flex-1 flex-col">
                    <motion.div
                        key={isRegistering ? 'register' : 'login'}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 20,
                        }}
                    >
                        {!isRegistering ? (
                            <Form
                                {...login.form()}
                                resetOnSuccess={['password']}
                                onError={handleLoginError}
                                className="mx-9 flex flex-1"
                            >
                                {({ processing, errors }) => (
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h1 className="text-xs">
                                            <span className="text-2xl font-bold">
                                                {' '}
                                                Welcome back
                                            </span>
                                            ,<br /> please login to your
                                            account.
                                        </h1>

                                        <div className="mt-5 flex w-full flex-col gap-3">
                                            <Label htmlFor="email">
                                                Email address
                                            </Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    placeholder="email@example.com"
                                                />
                                                <InputGroupAddon>
                                                    <Mail />
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError
                                                message={errors.email}
                                            />

                                            <Label htmlFor="password">
                                                Password
                                            </Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="password"
                                                    type={
                                                        isPasswordShow
                                                            ? 'password'
                                                            : 'text'
                                                    }
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    onInput={(e) =>
                                                        removeEmojis(
                                                            e.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Password"
                                                />
                                                <InputGroupAddon>
                                                    <LockIcon />
                                                </InputGroupAddon>
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        variant="ghost"
                                                        onClick={() =>
                                                            togglePassword(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                    >
                                                        {isPasswordShow ? (
                                                            <EyeClosed />
                                                        ) : (
                                                            <Eye />
                                                        )}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mx-auto my-4 w-full"
                                            tabIndex={4}
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />} Log in
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="mx-auto w-full"
                                            type="button"
                                            onClick={() =>
                                                setIsRegistering(true)
                                            }
                                            tabIndex={5}
                                        >
                                            Register
                                        </Button>

                                        <div className="grid grid-cols-2">
                                            <p className="mt-2 text-center text-blue-500">
                                                <a
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        toggleDts(
                                                            (prev) => !prev,
                                                        )
                                                    }
                                                >
                                                    Data Privacy Statement
                                                </a>
                                            </p>

                                            <Link
                                                href={'/forgot-password'}
                                                className="mt-2 text-center text-blue-500"
                                            >
                                                Forgot Password
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        ) : (
                            <Form
                                {...register.form()}
                                resetOnSuccess={[
                                    'password',
                                    'password_confirmation',
                                ]}
                                onSuccess={() => {
                                    toast.success(
                                        'Account created successfully! Please wait for admin approval.',
                                    );
                                    setTimeout(
                                        () => setIsRegistering(false),
                                        600,
                                    );
                                }}
                                className="mx-9 flex flex-1"
                            >
                                {({ processing, errors }) => (
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h1 className="text-xs">
                                            <span className="text-2xl font-bold">
                                                Create Account
                                            </span>
                                            ,<br /> please fill in the details
                                            below.
                                        </h1>

                                        <div className="mt-5 flex w-full flex-col gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="name"
                                                    name="name"
                                                    required
                                                    tabIndex={1}
                                                    placeholder="Your Name"
                                                />
                                                <InputGroupAddon>
                                                    <User />
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError message={errors.name} />

                                            <Label htmlFor="reg_email">
                                                Email address
                                            </Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="reg_email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    placeholder="email@example.com"
                                                />
                                                <InputGroupAddon>
                                                    <Mail />
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError
                                                message={errors.email}
                                            />

                                            <Label htmlFor="reg_password">
                                                Password
                                            </Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="reg_password"
                                                    name="password"
                                                    type={
                                                        isRegPasswordShow
                                                            ? 'password'
                                                            : 'text'
                                                    }
                                                    required
                                                    tabIndex={3}
                                                    minLength={6}
                                                    onInput={(e) =>
                                                        removeEmojis(
                                                            e.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Password"
                                                />
                                                <InputGroupAddon>
                                                    <LockIcon />
                                                </InputGroupAddon>
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setIsRegPasswordShow(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                    >
                                                        {isRegPasswordShow ? (
                                                            <EyeClosed />
                                                        ) : (
                                                            <Eye />
                                                        )}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError
                                                message={errors.password}
                                            />

                                            <Label htmlFor="password_confirmation">
                                                Confirm Password
                                            </Label>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type={
                                                        isRegPasswordShow
                                                            ? 'password'
                                                            : 'text'
                                                    }
                                                    required
                                                    tabIndex={4}
                                                    minLength={6}
                                                    onInput={(e) =>
                                                        removeEmojis(
                                                            e.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Confirm Password"
                                                />
                                                <InputGroupAddon>
                                                    <LockIcon />
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mx-auto my-4 w-full"
                                            tabIndex={5}
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />} Register
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="mx-auto w-full"
                                            type="button"
                                            onClick={() =>
                                                setIsRegistering(false)
                                            }
                                            tabIndex={6}
                                        >
                                            Back to Login
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        )}
                    </motion.div>
                </div>

                <Card className="relative my-2 hidden flex-2 flex-col justify-between overflow-hidden bg-linear-to-br from-black via-indigo-950 to-purple-950 md:flex">
                    <motion.img
                        animate={{ y: [10, -10, 10] }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeIn',
                        }}
                        src="/images/juWAHcombine.png"
                        className="absolute -bottom-110 left-1/2 z-50 h-[130%] -translate-x-1/2"
                    />
                    <div className="z-50 flex flex-col items-center justify-center pl-5 text-xs text-white">
                        <img
                            src="/images/wahIconOriginal.png"
                            className="h-auto w-20"
                        />
                        <div>
                            <h1 className="flex items-center justify-center text-3xl font-extrabold">
                                WAHEMS
                            </h1>
                            <p className="text-center opacity-75">
                                Wireless Access for Health Event Management
                                System
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
