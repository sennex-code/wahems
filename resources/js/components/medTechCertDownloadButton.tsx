import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MedTechCertPdfDocument } from "@/pages/certificateTemps/MedTechCert.pdf";

export function MedTechCertDownloadButton(props: any) {
  return (
    <PDFDownloadLink
      document={
        <MedTechCertPdfDocument {...props} assetBaseUrl={props.assetBaseUrl} />
      }
      fileName={`Certificate-26-${props.fac_id}-${props.data?.id}.pdf`}
      style={{ textDecoration: "none" }} // prevent link underline
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          className="print:hidden inline-flex place-self-center items-center gap-2 px-6 py-3 bg-[#2e2a5e] hover:bg-[#3f3a7d] disabled:opacity-60 text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-95 group"
        >
          {/* icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-300 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>

          <span>{loading ? "Preparing PDF..." : "Download As PDF"}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
}