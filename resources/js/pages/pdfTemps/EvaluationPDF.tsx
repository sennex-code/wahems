import React from 'react';
import { 
  Page, 
  Text, 
  View, 
  Document, 
  StyleSheet, 
  Image,
  PDFDownloadLink 
} from '@react-pdf/renderer';
import wahHeader from '../../../../public/images/WAHHeader.jpg';

// --- Types ---
// This matches the data structure you are generating in your main component
export interface EvaluationData {
    facilitatorName: string;
    eventTitle: string;
    metrics: {
        question: string;
        subtitle?: string; // Optional additional info about the question
        average: string | null; // Rating score (e.g. "4.5")
        comments: string[];     // Text feedback
        responseCount: number;
    }[];
}

// --- Styles (Mimicking the WAH Physical Form) ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerLeft: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#632b84', 
  },
  headerRight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0070c0',
  },
  blueBar: {
    backgroundColor: '#0070c0',
    height: 12,
    width: '100%',
    marginBottom: 15,
  },
  mainTitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  infoRow: {
    marginBottom: 12,
    fontSize: 11,
  },
  bold: {
    fontWeight: 'bold',
  },
  // Table Layout
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  colContent: {
    width: '75%',
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  colRating: {
    width: '25%',
    padding: 6,
    textAlign: 'center',
  },
  // Feedback Section
  commentBox: {
    borderWidth: 1,
    borderColor: '#000',
    borderTopWidth: 0,
    padding: 10,
  },
  commentItem: {
    marginBottom: 4,
    fontSize: 9,
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    borderTopWidth: 0.5,
    paddingTop: 10,
    color: '#444',
  },
  footerBlue: {
    color: '#0070c0',
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 2,
  }
});

// --- PDF Document Structure ---
export const EvaluationDocument = ({ data,wahHeader }: { data: EvaluationData, wahHeader: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* WAH Branding */}
      <View style={styles.headerContainer}>
       <Image src={wahHeader} style={styles.headerLeft} />
      </View>
    

      <Text style={styles.mainTitle}>Evaluation Form for Resource Persons</Text>

      {/* Header Info */}
      <View style={styles.infoRow}>
        <Text><Text style={styles.bold}>PROGRAM TITLE: </Text>{data.eventTitle}</Text>
      </View>

      <View style={styles.table}>
        {/* Name Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={{ width: '100%', padding: 6 }}>
            <Text style={styles.bold}>NAME OF FACILITATOR: </Text>{data.facilitatorName}
          </Text>
        </View>

        {/* Column Headers */}
        <View style={styles.tableRow}>
          <View style={styles.colContent}><Text style={styles.bold}>A. CONTENT AND DELIVERY</Text></View>
          <View style={styles.colRating}><Text style={styles.bold}>RATING (AVG)</Text></View>
        </View>

        {/* Dynamic Metrics (Rating Questions) */}
        {data.metrics.filter(m => m.average !== null).map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.colContent}>
              <Text style={styles.bold}>{index + 1}. {item.question}</Text>
              <Text>{item.subtitle}</Text>
            </View>
            <View style={styles.colRating}>
              <Text>{item.average}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Qualitative Feedback (Comments) */}
      <View style={styles.commentBox}>
        <Text style={[styles.bold, { marginBottom: 5 }]}>STRENGTHS & FEEDBACK</Text>
        {data.metrics
          .filter(m => m.comments.length > 0)
          .flatMap(m => m.comments)
          .slice(0, 10) // Limit to avoid page overflow
          .map((comment, i) => (
            <Text key={i} style={styles.commentItem}>• "{comment}"</Text>
          ))}
      </View>

      {/* Standard WAH Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBlue}>For Healthier, Happier Communities</Text>
        <Text>Diwa ng Tarlac, Romulo Boulevard, San Vicente, Tarlac City 2300</Text>
        <Text>Telefax: (045) 985-5607 | Webpage: http://wah.ph | Email: wah.pilipinas@gmail.com</Text>
        <Text>Contacts: (045) 985-5607 / 09985651432 / 09175297095</Text>
      </View>
    </Page>
  </Document>
);