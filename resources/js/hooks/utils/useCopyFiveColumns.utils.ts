import { toast } from 'sonner';
import { toFullName } from './useToFullName.utils';

export const copyFiveColumns = async (eventParticipant: any) => {
    const p = eventParticipant?.participant;

    const fullName = toFullName(p);
    const pEmail = p?.email ?? '';
    const pAge = p?.age ?? '';
    const pGender = p?.gender ?? '';
    const designation = p?.designation ?? '';
    const mobile = p?.mobile_number ?? '';

    // TSV => paste into 5 columns
    const tsv = `${fullName}\t${pEmail}\t${pAge}\t${pGender}\t${designation}\t${mobile}`;

    try {
        await navigator.clipboard.writeText(tsv);
        toast.success('Copied to clipboard (3 columns).');
    } catch {
        toast.error('Copy failed. (Your browser may block clipboard access)');
    }
};
