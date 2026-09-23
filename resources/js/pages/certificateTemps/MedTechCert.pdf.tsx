import React, { useEffect, useState } from 'react';
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font
} from '@react-pdf/renderer';

type Props = {
    data: any;
    eventData: any;

    region?: string | { code?: string; name?: string };
    province: string | { code?: string; name?: string };
    municipality: string | { code?: string; name?: string };
    barangay: string | { code?: string; name?: string };

    isCPD: boolean;
    cpdCode?: string;

    totalHours: number | string;
    participantHoursAttended?: number | string; // NEW (for participation cert)

    isCompleted: boolean;

    selectedTopics: string[];

    accreditationCode?: string;
    includeWAHSignatories: boolean;

    // logo passed from controller (e.g. Event.logo or Cluster.cluster_logo)
    logo?: string | null;

    assetBaseUrl?: string;
    logoBase64: any;
    signatory: any;
    position: any;
    index: number;
};

// ---------- helpers to prevent "codes" showing in email PDFs ----------
type CodeName = string | { code?: string; name?: string } | null | undefined;

function displayName(value: CodeName): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    // prefer name; fallback to code if that's all we have
    return value.name?.toString().trim() || value.code?.toString().trim() || '';
}

// ---------- helpers for Name Formatting ----------
function formatName(name?: string): string {
    if (!name) return '';
    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getMiddleInitial(middleName?: string): string {
    if (!middleName || middleName.trim() === '') return '';
    return middleName.trim().charAt(0).toUpperCase() + '.';
}
// --------------------------------------------------------------------

// Print-safe inset to prevent border cropping on most printers.
// Increase to 12mm if your printer still cuts edges.
const SAFE_MM = 10;
const MM_TO_PT = 72 / 25.4;
const SAFE = SAFE_MM * MM_TO_PT;

// Internal padding inside the safe area
const PADDING = 24;

Font.register({
    family: "Allura",
    fonts: [
        { src: "/fonts/Allura-Regular.ttf" },
    ]
});

Font.register({
    family: "Great Vibes",
    fonts: [
        { src: "/fonts/GreatVibes-Regular.ttf", fontWeight: "bold" },
    ]
});

const styles = StyleSheet.create({
    page: {
        position: 'relative',
        backgroundColor: 'white',
    },

    // Border is inset (NOT full bleed) so it prints without being cropped.
    bgBorder: {
        position: 'absolute',
        top: SAFE,
        left: SAFE,
        right: SAFE,
        bottom: SAFE,
        width: 'auto',
        height: 'auto',
    },

    cert: {
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingTop: SAFE + PADDING,
        paddingLeft: SAFE + PADDING,
        paddingRight: SAFE + PADDING,
        paddingBottom: SAFE + PADDING,
        fontFamily: 'Times-Roman',
        fontWeight: 800,
    },

    headerLogosRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
    },

    logoLeft: {
        width: 78,
        height: 78,
        objectFit: 'contain',
    },
    logoCenter: {
        width: 70,
        height: 70,
        objectFit: 'contain',
        marginLeft: 14,
        marginRight: 14,
    },
    logoRight: {
        width: 70,
        height: 70,
        objectFit: 'contain',
    },

    body: {
        marginTop: 8,
        textAlign: 'center',
        position: 'relative',
    },

    purple: { color: '#2e2a5e' },

    accreditation: { fontSize: 13, fontWeight: 700, marginBottom: 2 },
    awardThis: {
        fontSize: 9.5,
        letterSpacing: 2,
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    title: { marginTop: 6, fontSize: 22, fontWeight: 900 },
    certNo: { marginTop: 2, fontSize: 9.5, fontStyle: 'italic' },

    toLabel: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    participantName: {
        marginTop: 8,
        fontSize: 30,
        fontFamily: 'Great Vibes',
        fontWeight: 900,
        color: '#000',
        paddingBottom: 1,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        alignSelf: 'center',
        paddingLeft: 10,
        paddingRight: 10,
    },

    completingLine: { marginTop: 10, fontSize: 11, fontWeight: 700 },
    trainingTitle: {
        marginTop: 5,
        fontSize: 15,
        fontWeight: 900,
        paddingLeft: 20,
        paddingRight: 20,
        lineHeight: 1.2,
    },

    dateVenueLine: {
        marginTop: 5,
        fontSize: 9.5,
        fontStyle: 'italic',
        fontWeight: 700,
        color: '#000',
    },

    introWrap: { marginTop: 14, paddingLeft: 18, paddingRight: 18 },
    introText: {
        fontSize: 10,
        fontWeight: 800,
        textAlign: 'center',
        color: '#000',
        lineHeight: 1.25,
    },

    // ---------- TOPICS CENTERING FIX ----------
    topicsOneColWrap: {
        marginLeft: 80,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topicsOneColList: {
        width: 360,
        maxWidth: '100%',
    },

    topicsTwoColWrap: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 18,
    },
    topicsCol: {
        width: 240,
        maxWidth: '50%',
    },

    topicItemRow: { flexDirection: 'row', marginBottom: 3 },
    topicText: {
        flex: 1,
        fontSize: 10,
        textAlign: 'left',
        fontWeight: 900,
        color: '#44007B',
    },
    // ----------------------------------------

    // Place CPD box inside printable area
    cpdBox: {
        position: "absolute",
        bottom: 50,
        left: "52%",
        transform: "translateX(-50%)",
        padding: 6,
    },
    cpdText: { fontSize: 9.5, fontWeight: 900, color: '#2e2a5e' },

    footerBlock: { marginTop: 30, alignItems: 'center' },
    hoursLine: {
        fontSize: 9.5,
        fontWeight: 700,
        paddingLeft: 18,
        paddingRight: 18,
        lineHeight: 1.25,
        textAlign: 'center',
    },
    awardedLine: {
        marginTop: 8,
        marginBottom: 10,
        fontSize: 9.5,
        fontWeight: 700,
        fontStyle: 'italic',
        textAlign: 'center',
    },

    signatoriesRow: {
        marginTop: 8,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
    },
    signatoriesBetween: { justifyContent: 'space-between' },
    signatoriesCenter: { justifyContent: 'center' },

    signatoryBox: {
        width: 220,
        alignItems: 'center',
        position: 'relative',
        minHeight: 85,
        paddingTop: 16,
        marginHorizontal: 6,
    },

    sigImagePrimary: {
        position: 'absolute',
        top: -10,
        height: 38,
        width: 150,
        objectFit: 'contain',
    },
    sigImageSecondary: {
        position: 'absolute',
        top: -20,
        height: 64,
        width: 190,
        objectFit: 'contain',
    },

    sigName: {
        width: '100%',
        fontSize: 11,
        fontWeight: 900,
        color: '#2e2a5e',
        textTransform: 'uppercase',
        borderBottomWidth: 2,
        borderBottomColor: '#2e2a5e',
        textAlign: 'center',
        paddingBottom: 3,
    },

    sigTitle: {
        marginTop: 3,
        fontSize: 8.5,
        fontWeight: 700,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    sigOrg: {
        marginTop: 2,
        fontSize: 8.5,
        fontWeight: 700,
        textAlign: 'center',
    },
});

function withBase(base: string | undefined, path: string) {
    if (!path) return path;

    // already a URL or data URI
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;

    if (!base) return path;

    const trimmedBase = base.replace(/\/+$/, '');
    const trimmedPath = path.replace(/^\/+/, '');
    return `${trimmedBase}/${trimmedPath}`;
}

// If your logo is a storage filename/path, convert to /storage/... URL
function toStorageUrl(
    base: string | undefined,
    storagePathOrUrl?: string | null,
) {
    if (!storagePathOrUrl) return '';
    if (
        /^https?:\/\//i.test(storagePathOrUrl) ||
        storagePathOrUrl.startsWith('data:')
    ) {
        return storagePathOrUrl;
    }
    if (storagePathOrUrl.startsWith('storage/')) {
        return withBase(base, `/${storagePathOrUrl}`);
    }
    return withBase(base, `/storage/${storagePathOrUrl}`);
}

function ordinalSuffix(day: number) {
    return day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';
}

function formatSameMonthRange(startDate: Date, endDate: Date) {
    const left = startDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
    });
    const rightDay = endDate.toLocaleDateString('en-US', { day: 'numeric' });
    const year = endDate.toLocaleDateString('en-US', { year: 'numeric' });
    return `${left}-${rightDay}, ${year}`;
}

function formatDifferentMonthRange(startDate: Date, endDate: Date) {
    const left = startDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
    });
    const right = endDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    return `${left} - ${right}`;
}

export const MedTechCertPdfDocument: React.FC<Props> = ({
    data,
    eventData,
    region,
    province,
    municipality,
    barangay,
    isCPD,
    cpdCode,
    totalHours,
    participantHoursAttended,
    isCompleted,
    selectedTopics,
    accreditationCode,
    includeWAHSignatories,
    assetBaseUrl,
    logo,
    logoBase64,
    signatory,
    position,
    index,
}) => {

  
    const startDate = new Date(eventData.start_at);
    const endDate = new Date(eventData.end_at);

    const isSameMonth =
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear();

    const day = endDate.getDate();
    const suffix = ordinalSuffix(day);

    // --- OPTIMIZED NAME FORMATTING ---
    const firstName = formatName(data.first_name);
    const middleInit = getMiddleInitial(data.middle_initial);
    const lastName = formatName(data.last_name);

    // This cleanly filters out empty parts and joins them with a single space
    const participantFullName = [firstName, middleInit, lastName].filter(Boolean).join(' ');
    // ---------------------------------

    const dateRange = isSameMonth
        ? formatSameMonthRange(startDate, endDate)
        : formatDifferentMonthRange(startDate, endDate);

    // Normalize display strings (name preferred, code fallback)
    const regionName = displayName(region);
    const provinceName = displayName(province);
    const municipalityName = displayName(municipality);
    const barangayName = displayName(barangay);

    // (not printed currently, but normalized if needed later)
    void regionName;

    const facilityLine = `${eventData.address}`;

    const borderImg = withBase(assetBaseUrl, '/images/certBorder.png');
    const wahIcon = withBase(assetBaseUrl, '/images/wahIcon.jpg');
    const provLogo = withBase(assetBaseUrl, '/images/tarlacProvLogo.png');
    const esig = withBase(assetBaseUrl, '/images/EsigV2.png');

    const topics = selectedTopics ?? [];
    const useTwoColumns = topics.length > 18;

    const leftTopics = useTwoColumns
        ? topics.slice(0, Math.ceil(topics.length / 2))
        : topics;
    const rightTopics = useTwoColumns
        ? topics.slice(Math.ceil(topics.length / 2))
        : [];

    const certTypeText = isCompleted ? 'COMPLETION' : 'PARTICIPATION';

    // match your UI’s "Cluster" wording for the participation line
    const displayEventType =
        eventData?.type === 'Cluster' ? 'Cluster Assembly' : eventData?.type;

    const introText = isCompleted
        ? `This certificate is awarded based on the participants’ performance and attendance rating for the duration of the ${eventData?.type}. For this Certificate of Completion, the awardee satisfactorily completed all the requirements for the following EHR topics:`
        : `This certificate is awarded based on the participants’ performance and attendance rating for the duration of the ${eventData?.type}. For this Certificate of Participation, the awardee satisfactorily completed all the requirements for the following EHR topics:`;

    const hoursLine = isCompleted
        ? `This further certifies that the awardee successfully completed the required (${totalHours} hours) seminar and hands-on training.`
        : `This further certifies that the awardees successfully participated in (${
              participantHoursAttended ?? ''
          } hours) of the ${displayEventType} and hands-on training on the modules outlined above.`;
          
    const yearSuffix = new Date().getFullYear().toString().slice(-2);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image fixed style={styles.bgBorder} src={borderImg} />

                <View style={styles.cert} wrap={false}>
                    <View style={styles.headerLogosRow}>
                        <Image style={styles.logoLeft} src={wahIcon} />

                        {logoBase64 ? (
                            <>
                                <Image
                                    style={styles.logoCenter}
                                    src={logoBase64}
                                />
                            </>
                        ) : (
                            <>
                            </>
                        )}

                        <Image style={styles.logoRight} src={provLogo} />
                    </View>

                    <View style={styles.body}>
                        {isCPD && (
                            <Text style={[styles.accreditation, styles.purple]}>
                                {accreditationCode ?? ''}
                            </Text>
                        )}

                        <Text style={[styles.awardThis, styles.purple]}>
                            Award This
                        </Text>

                        <Text style={[styles.title, styles.purple]}>
                            CERTIFICATE OF {certTypeText}
                        </Text>

                      <Text style={[styles.certNo, styles.purple]}>
                        (Certificate #{yearSuffix}-{eventData.id}-{index.toString().padStart(3, '0')})
                        </Text>

                        <Text style={[styles.toLabel, styles.purple]}>To</Text>
                        <Text style={styles.participantName}>
                            {participantFullName}
                        </Text>

                        <Text style={[styles.completingLine, styles.purple]}>
                            for completing the {eventData.type} on
                        </Text>

                        <Text style={[styles.trainingTitle, styles.purple]}>
                            {eventData.name}
                        </Text>

                        <Text style={styles.dateVenueLine}>
                            from {dateRange} at {facilityLine}
                        </Text>

                        <View style={styles.introWrap}>
                            <Text style={styles.introText}>{introText}</Text>
                        </View>

                        {!useTwoColumns ? (
                            <View style={styles.topicsOneColWrap}>
                                <View style={styles.topicsOneColList}>
                                    {topics.map((topic, index) => (
                                        <View
                                            key={`${topic}-${index}`}
                                            style={styles.topicItemRow}
                                        >
                                            <Text style={styles.topicText}>
                                                {index + 1}. {topic}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.topicsTwoColWrap}>
                                <View style={styles.topicsCol}>
                                    {leftTopics.map((topic, idx) => (
                                        <View
                                            key={`L-${topic}-${idx}`}
                                            style={styles.topicItemRow}
                                        >
                                            <Text style={styles.topicText}>
                                                {idx + 1}. {topic}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.topicsCol}>
                                    {rightTopics.map((topic, idx) => {
                                        const num = leftTopics.length + idx + 1;
                                        return (
                                            <View
                                                key={`R-${topic}-${idx}`}
                                                style={styles.topicItemRow}
                                            >
                                                <Text style={styles.topicText}>
                                                    {num}. {topic}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <View style={styles.footerBlock}>
                            <Text style={styles.hoursLine}>{hoursLine}</Text>

                            <Text style={styles.awardedLine}>
                                This certificate is awarded this {day}
                                {suffix} day of{' '}
                                {endDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}{' '}
                                at {municipalityName}, {provinceName}.
                            </Text>

                            <View
                                style={[
                                    styles.signatoriesRow,
                                    includeWAHSignatories
                                        ? styles.signatoriesBetween
                                        : styles.signatoriesCenter,
                                ]}
                            >
                                <View style={styles.signatoryBox}>
                                    {!signatory && (
                                        <Image
                                            style={styles.sigImageSecondary}
                                            src={esig}
                                        />
                                    )}
                                    <Text style={styles.sigName}>
                                        {signatory ?? 'Oscar F. Picaso'}
                                    </Text>
                                    <Text style={styles.sigTitle}>
                                        {signatory ? position : 'President'}
                                    </Text>
                                    {!signatory? (
                                        <Text style={styles.sigOrg}>
                                            Wireless Access for Health
                                        </Text>
                                    ):(
                                          <Text style={styles.sigOrg}>
                                                {( municipalityName + ", " + provinceName || 'Wireless Access for Health')}
                                        </Text>
                                    )}
                                </View>

                                {includeWAHSignatories && (
                                    <View style={styles.signatoryBox}>
                                        <Image
                                            style={styles.sigImageSecondary}
                                            src={esig}
                                        />
                                        <Text style={styles.sigName}>
                                            Oscar F. Picaso
                                        </Text>
                                        <Text style={styles.sigTitle}>
                                            President
                                        </Text>
                                        <Text style={styles.sigOrg}>
                                            Wireless Access for Health
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {isCPD && (
                        <View style={styles.cpdBox}>
                            <Text style={styles.cpdText}>
                                CPD UNITS: {cpdCode}
                            </Text>
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};