import { Head } from '@inertiajs/react';
import Missing from '@/components/missing';
import AppLayout from '@/layouts/app-layout';

const Users = () => {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <Missing></Missing>
        </AppLayout>
    );
};

export default Users;
