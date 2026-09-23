import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MedTechCertPdfDocument } from "@/pages/certificateTemps/MedTechCert.pdf";

export function MedTechCertDownloadButton(props: any) {
  return (
    <PDFDownloadLink
      document={<MedTechCertPdfDocument {...props} assetBaseUrl={props.assetBaseUrl} />}
      fileName={`Certificate-26-${props.fac_id}-${props.data?.id}.pdf`}
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Download As PDF")}
    </PDFDownloadLink>
  );
}