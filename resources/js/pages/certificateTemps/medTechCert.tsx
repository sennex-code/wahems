import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import { MedTechCertPdfDocument } from './MedTechCert.pdf'; // adjust path if needed

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Format helpers
const toTitleCase = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const formatFullName = (p: any) => {
  const first = p?.first_name ? toTitleCase(String(p.first_name)) : '';
  const last = p?.last_name ? toTitleCase(String(p.last_name)) : '';

  // supports either `middle_initial` or `middle_name`
  const miRaw = p?.middle_initial ?? p?.middle_name ?? '';
  const mi =
    miRaw && String(miRaw).trim()
      ? `${String(miRaw).trim()[0].toUpperCase()}.`
      : '';

  return [first, mi, last].filter(Boolean).join(' ');
};

const MedTechCert = ({
  data,
  eventData,
  region,
  province,
  municipality,
  barangay,
  isCPD,
  cpdCode,
  totalHours,
  isCompleted,
  index,
  participantHoursAttended,
  selectedTopics,
  accreditationCode,
  includeWAHSignatories,
  logo,
  logoBase64,
  signatories,
  position,
}: any) => {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const startDate = new Date(eventData.start_at);
  const endDate = new Date(eventData.end_at);

  const isSameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const day = endDate.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  const buildPdfDoc = () => (
    <MedTechCertPdfDocument
      data={{
        ...data,
        // optional: pass pre-formatted name to the PDF doc too if you want
        formatted_name: formatFullName(data),
      }}
      eventData={eventData}
      region={region}
      province={province}
      municipality={municipality}
      barangay={barangay}
      isCPD={!!isCPD}
      cpdCode={cpdCode}
      isCompleted={isCompleted}
      totalHours={totalHours}
      participantHoursAttended={participantHoursAttended}
      selectedTopics={selectedTopics ?? []}
      accreditationCode={accreditationCode}
      includeWAHSignatories={!!includeWAHSignatories}
      logo={logo}
      logoBase64={logoBase64}
      assetBaseUrl={window.location.origin}
      signatory={signatories}
      position={position}
      index={index}
    />
  );

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await pdf(buildPdfDoc()).toBlob();
      const filename = `Certificate-26-${eventData.id}-${index + 1}.pdf`;
      await downloadBlob(blob, filename);
    } catch (e) {
      console.error('PDF download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleEmailPdf = async () => {
    try {
      setSendingEmail(true);

      const blob = await pdf(buildPdfDoc()).toBlob();
      const filename = `Certificate-26-${eventData.id}-${index + 1}.pdf`;

      const form = new FormData();
      form.append('participant_id', String(data.id));
      form.append('event_id', String(eventData.id));
      form.append(
        'certificate_pdf',
        new File([blob], filename, { type: 'application/pdf' })
      );

      form.append('cpd', String(!!isCPD));
      form.append('cpd_code', cpdCode ?? '');
      form.append('accred_code', accreditationCode ?? '');
      form.append('include_wah_signatories', String(!!includeWAHSignatories));
      form.append('topics', JSON.stringify(selectedTopics ?? []));

      const res = await axios.post('/certificates/email-upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      alert(res.data?.message ?? 'Email sent successfully.');
    } catch (e: any) {
      console.error('Email send failed:', e?.response?.data ?? e);
      alert(e?.response?.data?.message ?? 'Email failed (server error).');
    } finally {
      setSendingEmail(false);
    }
  };

  const serverDownloadUrl = useMemo(() => {
    const topicsParam = encodeURIComponent(JSON.stringify(selectedTopics ?? []));
    const params = new URLSearchParams();
    params.set('download', 'true');
    params.set('cpd', String(!!isCPD));
    params.set('cpd_code', cpdCode ?? '');
    params.set('topics', topicsParam);
    params.set('accred_code', accreditationCode ?? '');
    if (includeWAHSignatories) params.set('include_wah_signatories', 'true');

    return `/certificates/${data.id}/${eventData.id}?${params.toString()}`;
  }, [
    selectedTopics,
    isCPD,
    cpdCode,
    accreditationCode,
    includeWAHSignatories,
    data?.id,
    eventData?.id,
  ]);


  console.log("event on component render:", eventData);
  const topics = selectedTopics ?? [];
  const useTwoColumns = topics.length > 18;
  const leftTopics = useTwoColumns
    ? topics.slice(0, Math.ceil(topics.length / 2))
    : topics;
  const rightTopics = useTwoColumns
    ? topics.slice(Math.ceil(topics.length / 2))
    : [];

  return (
    <div className="flex w-full flex-col p-10 print:p-0">
      {/* Buttons */}
      <div className="inline-flex place-self-center gap-3 print:hidden">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading || sendingEmail}
          className="group inline-flex transform items-center gap-2 place-self-center rounded-lg bg-[#2e2a5e] px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#3f3a7d] active:scale-95 disabled:opacity-60"
          type="button"
        >
          <span>{downloading ? 'Preparing PDF...' : 'Download As PDF'}</span>
        </button>

        <button
          onClick={handleEmailPdf}
          disabled={sendingEmail || downloading}
          className="group inline-flex transform items-center gap-2 place-self-center rounded-lg bg-green-700 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-green-800 active:scale-95 disabled:opacity-60"
          type="button"
        >
          <span>{sendingEmail ? 'Sending...' : 'Email PDF'}</span>
        </button>
      </div>

      <div
        ref={certificateRef}
        className="relative h-[11.69in] w-[8.27in] place-self-center overflow-hidden bg-transparent pt-0 shadow-2xl print:h-[11.68in] print:w-[8.27in] print:shadow-none"
        style={{
          backgroundImage: "url('/images/certBorder.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div className="relative z-10 h-[13in] w-[8.5in] overflow-hidden bg-transparent p-[40px] pt-0 shadow-2xl print:w-full print:shadow-none">
          <div className="flex w-full items-center justify-center gap-4 px-10 pt-6">
            <img
              src="/images/wahIcon.png"
              className="h-32 w-32 rounded-full object-contain"
              alt="WAH"
            />

            {logoBase64 && (
              <img
                src={logoBase64}
                className={`${logo ? '' : 'hidden'} h-30 w-30 rounded-full object-contain`}
                alt="Municipality"
              />
            )}

            <img
              src="/images/tarlacProvLogo.png"
              className="h-30 w-30 rounded-full object-contain"
              alt="Province"
            />
          </div>

          <div className="relative px-12 text-center">
            <p
              className={
                isCPD ? `mb-0 text-lg font-bold text-[#2e2a5e]` : `hidden`
              }
            >
              {accreditationCode ?? ''}
            </p>

            <p className="text-sm font-bold tracking-widest text-[#2e2a5e] uppercase">
              Award This
            </p>

            <h1 className="font-certificate font-serif text-3xl font-black leading-tight text-[#2e2a5e]">
              CERTIFICATE OF {isCompleted ? 'COMPLETION' : 'PARTICIPATION'}
            </h1>

            <p className="text-sm italic text-[#2e2a5e]">
              (Certificate #{yearSuffix}-{eventData.id}-{index.toString().padStart(3, '0')})
            </p>

            <p className="mt-4 text-lg font-bold tracking-widest text-[#2e2a5e] uppercase">
              To
            </p>

            {/* UPDATED NAME FORMAT HERE */}
            <h2 className="font-greatvibes mt-2 inline-block border-b-2 border-black px-4 py-1 font-serif text-4xl font-bold text-black">
              {formatFullName(data)}
            </h2>

            <p className="mt-4 font-bold text-[#2e2a5e]">
              for completing the {eventData.type} on
            </p>

            <h3 className="mt-1 px-10 text-xl font-black leading-snug text-[#2e2a5e]">
              {eventData.name}
            </h3>

            <p className="mt-1 text-sm font-bold italic">
              from{' '}
              {isSameMonth ? (
                <>
                  {startDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                  -
                  {endDate.toLocaleDateString('en-US', {
                    day: 'numeric',
                  })}
                  ,{' '}
                  {endDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                  })}
                </>
              ) : (
                <>
                  {startDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  &nbsp;-&nbsp;{' '}
                  {endDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </>
              )}{' '}
              &nbsp; at &nbsp; {eventData.address}.
            </p>

            <div className="text-left text-[10px] leading-tight text-[#2e2a5e]">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-10 text-black">
                <p className="text-md w-130 text-center font-extrabold">
                  This certificate is awarded based on the participants’
                  performance and attendance rating for the duration of the{' '}
                  {' ' + eventData.type}. For this{' '}
                  {isCompleted
                    ? 'Certificate of Completion'
                    : 'Certificate of Participation'}
                  , the awardee satisfactorily completed all the requirements for
                  the following EHR topics:
                </p>
              </div>
            </div>

            {/* Topics */}
            {useTwoColumns ? (
              <div className="mt-2 grid grid-cols-2 gap-x-6 px-10">
                <ol className="list-decimal text-left text-[12px] font-black text-[#44007B]">
                  {leftTopics.map((topic: string, idx: number) => (
                    <li key={`L-${idx}`}>{topic}</li>
                  ))}
                </ol>

                <ol
                  className="list-decimal text-left text-[12px] font-black text-[#44007B]"
                  start={leftTopics.length + 1}
                >
                  {rightTopics.map((topic: string, idx: number) => (
                    <li key={`R-${idx}`}>{topic}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <ol className="mt-2 list-decimal place-self-center px-10 text-left text-[12px] font-black text-[#44007B]">
                {topics.map((topic: string, i: number) => (
                  <li key={i}>{topic}</li>
                ))}
              </ol>
            )}

            <div className="mt-5 flex flex-col items-center">
              {isCompleted ? (
                <p className="px-10 text-[11px] font-bold leading-snug text-black">
                  This further certifies that the awardee successfully completed
                  the required ({totalHours} hours) seminar and hands-on
                  training.
                </p>
              ) : (
                <p className="px-10 text-[11px] font-bold leading-snug text-black">
                  This further certifies that the awardees successfully
                  participated in ({participantHoursAttended} hours) of the{' '}
                  {eventData.type == 'Cluster'
                    ? 'Cluster Assembly'
                    : eventData.type}{' '}
                  and hands-on training on the modules outlined above.
                </p>
              )}

              <p className="mb-5 mt-4 text-[11px] font-bold italic text-black">
                This certificate is awarded this {day}
                {suffix} day of{' '}
                {endDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                at {eventData.address}.
              </p>

              <div
                className={`mt-5 flex w-full px-14 ${
                  includeWAHSignatories ? 'justify-between' : 'justify-center'
                }`}
              >
                <div className="relative flex w-[250px] flex-col items-center">
                  <p className="text-md w-full whitespace-nowrap border-b-2 border-[#2e2a5e] pb-1 text-center font-black text-[#2e2a5e] uppercase">
                    {signatories ?? 'Oscar F. Picaso'}
                  </p>

                  <p className="mt-1 text-center text-[10px] font-bold leading-tight text-black uppercase">
                    {signatories ? position : 'President'}
                  </p>
                    <p className="text-center text-[10px] text-black font-bold leading-tight">
                     {municipality ? municipality + ", " + province : 'Wireless Access for Health'}
                    </p>

                  {!signatories && (
                    <img
                      src="/images/EsigV2.png"
                      alt=""
                      className="absolute bottom-7 h-12 scale-[2]"
                    />
                  )}

                  {!signatories && (
                    <p className="text-center text-[10px] font-bold leading-tight">
                      Wireless Access for Health
                    </p>
                  )}
                </div>

                {includeWAHSignatories && (
                  <div className="relative flex w-[250px] flex-col items-center">
                    <p className="text-md w-full whitespace-nowrap border-b-2 border-[#2e2a5e] pb-1 text-center font-black text-[#2e2a5e] uppercase">
                      Oscar F. Picaso
                    </p>
                    <p className="mt-1 text-center text-[10px] font-bold leading-tight text-black uppercase">
                      President
                    </p>
                    <img
                      src="/images/EsigV2.png"
                      alt=""
                      className="absolute bottom-7 h-12 scale-[2] saturate-[10]"
                    />
                    <p className="text-center text-[10px] font-bold leading-tight">
                      Wireless Access for Health
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isCPD && (
            <p className="absolute bottom-50 left-[40%] border-2 border-black p-2 text-left font-black text-[#2e2a5e]">
              CPD UNITS: {cpdCode}
            </p>
          )}
        </div>
      </div>

      {/* Optional fallback link */}
      <a className="mt-4 text-center underline print:hidden" href={serverDownloadUrl}>
        Fallback server download
      </a>
    </div>
  );
};

export default MedTechCert;