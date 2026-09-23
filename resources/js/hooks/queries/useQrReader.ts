import { useMutation } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';

type UseQrReaderArgs = {
    setVerificationCode: Dispatch<SetStateAction<string | undefined>>;

    readerId?: string;
};

const useQrReader = ({
    setVerificationCode,
    readerId = 'reader',
}: UseQrReaderArgs) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);

    // camera scanner instance + state
    const qrRef = useRef<Html5Qrcode | null>(null);
    const [scanning, setScanning] = useState(false);

    const flashSuccessRing = useCallback(() => {
        if (!textRef.current) return;

        textRef.current.classList.add(
            'ring-1',
            'ring-green-400/70',
            'border',
            'border-green-500',
            'rounded-xl',
            'bg-green-500/10',
            'animate-pulse',
            'transition-all',
            'duration-300',
        );

        setTimeout(() => {
            textRef.current?.classList.remove(
                'ring-1',
                'ring-green-400/70',
                'border',
                'border-green-500',
                'rounded-xl',
                'bg-green-500/10',
                'animate-pulse',
                'transition-all',
                'duration-300',
            );
        }, 1500);
    }, []);

    // -----------------------------
    // Upload QR (scanFile)
    // -----------------------------
    const qr = useMutation({
        mutationKey: ['qr-upload'],
        mutationFn: async (e: ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || e.target.files.length === 0) return;

            const uploadedQR = e.target.files[0];

            // NOTE: scanFile() does not need camera start
            const htmlQrCode = new Html5Qrcode(readerId);
            const decoded = await htmlQrCode.scanFile(uploadedQR, true);
            return decoded;
        },
        onSuccess: (data) => {
            if (!data) return;

            if (inputRef.current) inputRef.current.value = '';
            flashSuccessRing();
            setVerificationCode(data);
        },
        onError: (e: any) => {
            toast.error(
                `Uploaded image is not a valid QR code. Please try again.`,
                {
                    position: 'top-center',
                },
            );

            if (inputRef.current) inputRef.current.value = '';
        },
    });

    // -----------------------------
    // Camera scanner (start/stop)
    // -----------------------------
    const stopScanner = useCallback(async () => {
        try {
            const inst = qrRef.current;
            if (!inst) {
                setScanning(false);
                return;
            }

            // Different html5-qrcode versions: stop()/clear() may be void or Promise<void>
            try {
                const r = inst.stop() as any;
                if (r && typeof r.then === 'function') await r;
            } catch {}

            try {
                const r2 = inst.clear() as any;
                if (r2 && typeof r2.then === 'function') await r2;
            } catch {}
        } finally {
            setScanning(false);
        }
    }, []);

    const startScanner = useCallback(async () => {
        try {
            if (scanning) return;

            qrRef.current = new Html5Qrcode(readerId);
            setScanning(true);

            await qrRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 300, height: 335 } },
                async (decodedText) => {
                    const val = decodedText?.trim();
                    if (!val) return;

                    flashSuccessRing();
                    setVerificationCode(val);

                    // stop camera after successful scan
                    await stopScanner();
                },
                () => {
                    // ignore per-frame decode errors
                },
            );
        } catch (err: any) {
            setScanning(false);
            toast.error(err?.message ?? 'Unable to start camera scanner', {
                position: 'top-center',
            });
        }
    }, [
        flashSuccessRing,
        readerId,
        scanning,
        setVerificationCode,
        stopScanner,
    ]);

    // Cleanup on unmount (important for camera)
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    return {
        // upload
        inputRef,
        textRef,
        qr,

        // camera
        scanning,
        startScanner,
        stopScanner,
    };
};

export default useQrReader;
