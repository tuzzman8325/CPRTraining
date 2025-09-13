import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Instructor information (could be moved to configuration or database later)
const INSTRUCTOR_INFO = {
  name: "Jennifer Martinez, RN",
  title: "AHA Certified CPR Instructor",
  certification: "AHA Training Center #123456",
  contact: "info@cprtraining.com | (555) 123-4567",
  address: "123 Training Center Dr, Health City, HC 12345"
};

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 10,
  },
  classInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
  },
  classInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  classInfoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    width: '30%',
  },
  classInfoValue: {
    fontSize: 11,
    color: '#1f2937',
    width: '70%',
  },
  instructorInfo: {
    backgroundColor: '#eff6ff',
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'solid',
  },
  instructorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructorText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
  },
  rosterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableColHeader: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCol: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 6,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 8,
    color: '#1f2937',
  },
  tableCellSmall: {
    fontSize: 7,
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  statItem: {
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    right: 30,
    color: '#9ca3af',
  },
});

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  paymentIntentId: string | null;
  amountPaid: number | null;
  discountCodeId: string | null;
  discountCode?: {
    code: string;
    description: string | null;
  };
}

interface ClassData {
  id: string;
  title: string;
  type: 'BLS' | 'Heartsaver';
  date: string;
  time: string;
  duration: string;
  capacity: number;
  available: number;
  price: number;
}

interface ClassRosterPDFProps {
  classData: ClassData;
  registrations: Registration[];
  generatedDate?: string;
}

export const ClassRosterPDF = ({ classData, registrations, generatedDate }: ClassRosterPDFProps) => {
  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'N/A';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getPaymentMethod = (registration: Registration) => {
    if (registration.discountCode) {
      return `Discount Code: ${registration.discountCode.code}`;
    } else if (registration.paymentIntentId) {
      return `Paid ${formatCurrency(registration.amountPaid)}`;
    }
    return 'Pending Payment';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalPaid = registrations.reduce((sum, reg) => {
    return sum + (reg.amountPaid || 0);
  }, 0);

  const discountCodeUsers = registrations.filter(reg => reg.discountCode).length;
  const paidUsers = registrations.filter(reg => reg.paymentIntentId).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CLASS ROSTER</Text>
          <Text style={styles.subtitle}>CPR Training Center - Class Registration List</Text>
        </View>

        {/* Class Information */}
        <View style={styles.classInfo}>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Class Title:</Text>
            <Text style={styles.classInfoValue}>{classData.title}</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Course Type:</Text>
            <Text style={styles.classInfoValue}>{classData.type}</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Date:</Text>
            <Text style={styles.classInfoValue}>{formatDate(classData.date)}</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Time:</Text>
            <Text style={styles.classInfoValue}>{classData.time}</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Duration:</Text>
            <Text style={styles.classInfoValue}>{classData.duration}</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Class Capacity:</Text>
            <Text style={styles.classInfoValue}>{classData.capacity} students</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Enrolled:</Text>
            <Text style={styles.classInfoValue}>{registrations.length} students</Text>
          </View>
          <View style={styles.classInfoRow}>
            <Text style={styles.classInfoLabel}>Available Spots:</Text>
            <Text style={styles.classInfoValue}>{classData.available} remaining</Text>
          </View>
        </View>

        {/* Instructor Information */}
        <View style={styles.instructorInfo}>
          <Text style={styles.instructorTitle}>Instructor Information</Text>
          <Text style={styles.instructorText}>{INSTRUCTOR_INFO.name}</Text>
          <Text style={styles.instructorText}>{INSTRUCTOR_INFO.title}</Text>
          <Text style={styles.instructorText}>{INSTRUCTOR_INFO.certification}</Text>
          <Text style={styles.instructorText}>{INSTRUCTOR_INFO.contact}</Text>
          <Text style={styles.instructorText}>{INSTRUCTOR_INFO.address}</Text>
        </View>

        {/* Roster Title */}
        <Text style={styles.rosterTitle}>Student Roster</Text>

        {/* Student Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Name</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Email</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Phone</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Course</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Payment</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
          </View>

          {/* Student Rows */}
          {registrations.map((registration, index) => (
            <View style={styles.tableRow} key={registration.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {registration.firstName} {registration.lastName}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellSmall}>{registration.email}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellSmall}>{registration.phone || 'N/A'}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{classData.type}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellSmall}>{getPaymentMethod(registration)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {registration.paymentIntentId || registration.discountCode ? 'Confirmed' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Enrolled</Text>
            <Text style={styles.statValue}>{registrations.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Paid Registrations</Text>
            <Text style={styles.statValue}>{paidUsers}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Discount Codes</Text>
            <Text style={styles.statValue}>{discountCodeUsers}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>{formatCurrency(totalPaid)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {generatedDate || new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} | CPR Training Center - Professional Certification Services
        </Text>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
          `Page ${pageNumber} of ${totalPages}`
        } fixed />
      </Page>
    </Document>
  );
};