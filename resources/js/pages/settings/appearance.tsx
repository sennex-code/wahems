import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { edit as editAppearance } from '@/routes/appearance';
import dashboard from '@/routes/dashboard';
import Hello from '../../../../public/images/Hello.png';

export default function Appearance() {
    return (
        <AppLayout>
            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </div>

              
            </SettingsLayout>
              <img src={Hello} alt="" className='absolute -bottom-60 right-0  w-lg' />
        </AppLayout>
    );
}
