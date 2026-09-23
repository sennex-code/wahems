import React, { useMemo } from 'react';
import {
  Baby,
  BadgeCheck,
  BadgeX,
  ClipboardList,
  HeartPulse,
  Keyboard,
  Layers,
  Pill,
  Smile,
  Stethoscope,
  Users,
  Users2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Header } from '../reusable/header';

export type CountsPerDesignationRow = {
  designation: string;
  total_count: number | string;
  cpd_count: number | string;
  non_cpd_count: number | string;
};

const FEATURED_KEYS = [
  'Physician',
  'Midwife',
  'Nurse',
  'Dentist',
  'Encoder',
  'Clerk',
  'Barangay Health Worker',
  'Pharmacist',
  'Medical Technologist',
] as const;

const LABEL_MAP: Record<(typeof FEATURED_KEYS)[number], string> = {
  Physician: 'Physicians',
  Midwife: 'Midwives',
  Nurse: 'Nurses',
  Dentist: 'Dentist',
  Encoder: 'Encoders',
  Clerk: 'Clerk',
  'Barangay Health Worker': 'Barangay Health Worker',
  Pharmacist: 'Pharmacist',
  'Medical Technologist': 'Medical Technologist',
};

const ICON_MAP: Record<
  (typeof FEATURED_KEYS)[number] | 'Others',
  { icon: React.ElementType; wrapClass: string }
> = {
  Physician: { icon: Stethoscope, wrapClass: 'bg-blue-500/15 text-blue-600' },
  Midwife: { icon: Baby, wrapClass: 'bg-pink-500/15 text-pink-600' },
  Nurse: { icon: HeartPulse, wrapClass: 'bg-emerald-500/15 text-emerald-600' },
  Dentist: { icon: Smile, wrapClass: 'bg-violet-500/15 text-violet-600' },
  Encoder: { icon: Keyboard, wrapClass: 'bg-amber-500/15 text-amber-700' },
  Clerk: { icon: ClipboardList, wrapClass: 'bg-cyan-500/15 text-cyan-700' },
  'Barangay Health Worker': {
    icon: Users,
    wrapClass: 'bg-orange-500/15 text-orange-700',
  },
  Pharmacist: { icon: Pill, wrapClass: 'bg-teal-500/15 text-teal-700' },
  'Medical Technologist': { icon: Stethoscope, wrapClass: 'bg-green-500/15 text-green-700' },
  Others: { icon: Layers, wrapClass: 'bg-slate-500/15 text-slate-700' },
};

type MiniKpiProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  iconWrapClass: string;
};

const MiniKpi: React.FC<MiniKpiProps> = ({
  label,
  value,
  icon: Icon,
  iconWrapClass,
}) => (
  <Card className="bg-background">
    <CardContent className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-black tracking-tight text-foreground">
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrapClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

type StatCardProps = {
  label: string;
  total: number;
  cpd: number;
  nonCpd: number;
  icon: React.ElementType;
  iconWrapClass: string;
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  total,
  cpd,
  nonCpd,
  icon: Icon,
  iconWrapClass,
}) => (
  <Card className="w-[20rem] overflow-hidden bg-background">
    <CardHeader className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="text-lg font-semibold leading-none">
          {label}
        </CardTitle>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrapClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardHeader>

    <CardContent className="px-4 pb-4 pt-0">
      <div className="text-3xl font-black tracking-tight text-foreground">
        {total.toLocaleString()}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" />
          CPD: {cpd.toLocaleString()}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700">
          <BadgeX className="h-3.5 w-3.5" />
          Non‑CPD: {nonCpd.toLocaleString()}
        </span>
      </div>
    </CardContent>
  </Card>
);

type Props = {
  participantCountsByDesignation: CountsPerDesignationRow[];
  cpdCount: number; // overall licensed
  nonCpdCount: number; // overall not licensed
};

const DesignationCard: React.FC<Props> = ({
  participantCountsByDesignation,
  cpdCount,
  nonCpdCount,
}) => {
  // Normalize backend array -> lookup by designation
  const byDesignation = useMemo(() => {
    const rows = Array.isArray(participantCountsByDesignation)
      ? participantCountsByDesignation
      : [];

    return rows.reduce((acc, row) => {
      const key = row.designation ?? '';
      if (!key) return acc;

      acc[key] = {
        total: Number(row.total_count ?? 0),
        cpd: Number(row.cpd_count ?? 0),
        nonCpd: Number(row.non_cpd_count ?? 0),
      };
      return acc;
    }, {} as Record<string, { total: number; cpd: number; nonCpd: number }>);
  }, [participantCountsByDesignation]);

  const featuredSet = useMemo(
    () => new Set<string>(FEATURED_KEYS as unknown as string[]),
    []
  );

  const featuredCards = useMemo(() => {
    return FEATURED_KEYS.map((key) => {
      const stats = byDesignation[key] ?? { total: 0, cpd: 0, nonCpd: 0 };
      return {
        key,
        label: LABEL_MAP[key],
        total: stats.total,
        cpd: stats.cpd,
        nonCpd: stats.nonCpd,
        icon: ICON_MAP[key].icon,
        iconWrapClass: ICON_MAP[key].wrapClass,
      };
    });
  }, [byDesignation]);

  // Sum non-featured designations into "Others"
  const othersStats = useMemo(() => {
    return Object.entries(byDesignation).reduce(
      (sum, [designation, stats]) => {
        if (designation === 'Others') return sum;
        if (featuredSet.has(designation)) return sum;

        sum.total += stats.total;
        sum.cpd += stats.cpd;
        sum.nonCpd += stats.nonCpd;
        return sum;
      },
      { total: 0, cpd: 0, nonCpd: 0 }
    );
  }, [byDesignation, featuredSet]);

  return (
    <Card className="w-full">
      <Header
        subHeaderIcon={Users2}
        subHeader={true}
        length={featuredCards.length + 1}
        label="Participant Distribution By Designation"
        description="Breakdown of participant counts by key designations, with remaining roles grouped under Others."
      />

      <CardContent className="space-y-4 p-4 md:p-5">
        {/* Overall CPD / Non-CPD raw numbers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniKpi
            label="Licensed on record (CPD)"
            value={cpdCount ?? 0}
            icon={BadgeCheck}
            iconWrapClass="bg-emerald-500/15 text-emerald-700"
          />

          <MiniKpi
            label="Not Licensed on record (Non‑CPD)"
            value={nonCpdCount ?? 0}
            icon={BadgeX}
            iconWrapClass="bg-rose-500/15 text-rose-700"
          />
        </div>

        {/* Designation cards with total + CPD/Non-CPD per designation */}
        <div className="flex flex-wrap gap-4">
          {featuredCards.map((c) => (
            <StatCard
              key={c.key}
              label={c.label}
              total={c.total}
              cpd={c.cpd}
              nonCpd={c.nonCpd}
              icon={c.icon}
              iconWrapClass={c.iconWrapClass}
            />
          ))}

          <StatCard
            label="Others"
            total={othersStats.total}
            cpd={othersStats.cpd}
            nonCpd={othersStats.nonCpd}
            icon={ICON_MAP.Others.icon}
            iconWrapClass={ICON_MAP.Others.wrapClass}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignationCard;