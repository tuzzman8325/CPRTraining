import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import { Class } from '@shared/schema';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    paddingBottom: 15,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    color: '#666666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#333333',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#333333',
    marginLeft: 15,
    marginBottom: 5,
  },
  highlightBox: {
    backgroundColor: '#F0F8FF',
    border: '2px solid #8B0000',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
  },
  priceBox: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactColumn: {
    flex: 1,
  },
  contactText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
  ahaCertification: {
    fontSize: 10,
    color: '#8B0000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  classItem: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    border: '1px solid #E0E0E0',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 5,
  },
  classDetail: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 3,
  },
  classStatus: {
    fontSize: 10,
    color: '#228B22',
    fontWeight: 'bold',
  },
  scheduleTable: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    padding: 8,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 8,
  },
  tableCellText: {
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
    color: '#333333',
  },
});

// BLS Course Flyer Component
export const BLSFlyerPDF = ({ classes }: { classes: Class[] }) => {
  const blsClasses = classes.filter(c => c.type === 'BLS');
  const nextBLSClass = blsClasses
    .filter(c => parseLocalDate(c.date) >= new Date())
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.businessName}>LifeSaver CPR Training</Text>
            <Text style={styles.tagline}>American Heart Association Certified Instructor</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Basic Life Support (BLS) Provider Course</Text>
        <Text style={styles.subtitle}>For Healthcare Professionals & Emergency Responders</Text>

        {/* Course Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Overview</Text>
          <Text style={styles.text}>
            The BLS Provider Course is designed for healthcare professionals and trained first responders who 
            provide care to patients in a wide variety of in-facility and out-of-hospital settings.
          </Text>
          <Text style={styles.text}>
            This course teaches both single-rescuer and team basic life support skills for application in both 
            in-facility and prehospital settings.
          </Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <Text style={styles.bulletPoint}>• High-quality CPR for adults, children, and infants</Text>
          <Text style={styles.bulletPoint}>• Use of automated external defibrillator (AED)</Text>
          <Text style={styles.bulletPoint}>• Relief of foreign-body airway obstruction (choking)</Text>
          <Text style={styles.bulletPoint}>• Use of bag-mask device for rescue breathing</Text>
          <Text style={styles.bulletPoint}>• Team-based resuscitation scenarios</Text>
          <Text style={styles.bulletPoint}>• Effective communication during emergency situations</Text>
        </View>

        {/* Course Details */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>Course Duration: 4 Hours | Maximum 12 Students</Text>
        </View>

        {/* Next Class Information */}
        {nextBLSClass && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Available Class</Text>
            <Text style={styles.text}>
              Date: {format(parseLocalDate(nextBLSClass.date), 'MMMM d, yyyy')} at {nextBLSClass.time}
            </Text>
            <Text style={styles.text}>
              Available Spots: {nextBLSClass.available} of {nextBLSClass.capacity}
            </Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>${nextBLSClass.price} per person</Text>
            </View>
          </View>
        )}

        {/* Certification Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification</Text>
          <Text style={styles.text}>
            Upon successful completion, students receive an AHA BLS Provider Course Completion Card, 
            valid for 2 years.
          </Text>
          <Text style={styles.text}>
            This certification meets the requirements for most healthcare employers and is recognized nationwide.
          </Text>
        </View>

        {/* Prerequisites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Should Take This Course</Text>
          <Text style={styles.bulletPoint}>• Healthcare providers (nurses, doctors, therapists)</Text>
          <Text style={styles.bulletPoint}>• Emergency medical technicians (EMTs)</Text>
          <Text style={styles.bulletPoint}>• Paramedics and first responders</Text>
          <Text style={styles.bulletPoint}>• Medical and nursing students</Text>
          <Text style={styles.bulletPoint}>• Anyone requiring BLS certification for work</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.contactInfo}>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📞 (555) 123-4567</Text>
              <Text style={styles.contactText}>✉️ info@lifesavercpr.com</Text>
            </View>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📍 123 Training Center Lane</Text>
              <Text style={styles.contactText}>Medical Plaza, Suite 200</Text>
              <Text style={styles.contactText}>Healthcare City, HC 12345</Text>
            </View>
          </View>
          <Text style={styles.ahaCertification}>
            American Heart Association Certified Training Center
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Heartsaver Course Flyer Component
export const HeartsaverFlyerPDF = ({ classes }: { classes: Class[] }) => {
  const heartsaverClasses = classes.filter(c => c.type === 'Heartsaver');
  const nextHeartsaverClass = heartsaverClasses
    .filter(c => parseLocalDate(c.date) >= new Date())
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.businessName}>LifeSaver CPR Training</Text>
            <Text style={styles.tagline}>American Heart Association Certified Instructor</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Heartsaver CPR Course</Text>
        <Text style={styles.subtitle}>Essential Life-Saving Skills for Everyone</Text>

        {/* Course Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Overview</Text>
          <Text style={styles.text}>
            The Heartsaver CPR course is designed for anyone with limited or no medical training who needs 
            CPR and AED training and a course completion card for their job, regulatory requirements, or other reasons.
          </Text>
          <Text style={styles.text}>
            This course teaches the critical skills needed to respond to and manage emergencies 
            involving choking or cardiac arrest in adults, children, and infants.
          </Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <Text style={styles.bulletPoint}>• Adult, child, and infant CPR techniques</Text>
          <Text style={styles.bulletPoint}>• Proper use of automated external defibrillator (AED)</Text>
          <Text style={styles.bulletPoint}>• Relief of choking in conscious and unconscious victims</Text>
          <Text style={styles.bulletPoint}>• How to recognize cardiac arrest and choking</Text>
          <Text style={styles.bulletPoint}>• When and how to call for emergency medical services</Text>
          <Text style={styles.bulletPoint}>• Hands-on practice with CPR mannequins and AED trainers</Text>
        </View>

        {/* Course Details */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>Course Duration: 3 Hours | Maximum 16 Students</Text>
        </View>

        {/* Next Class Information */}
        {nextHeartsaverClass && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Available Class</Text>
            <Text style={styles.text}>
              Date: {format(parseLocalDate(nextHeartsaverClass.date), 'MMMM d, yyyy')} at {nextHeartsaverClass.time}
            </Text>
            <Text style={styles.text}>
              Available Spots: {nextHeartsaverClass.available} of {nextHeartsaverClass.capacity}
            </Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>${nextHeartsaverClass.price} per person</Text>
            </View>
          </View>
        )}

        {/* Certification Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification</Text>
          <Text style={styles.text}>
            Upon successful completion, students receive an AHA Heartsaver CPR Course Completion Card, 
            valid for 2 years.
          </Text>
          <Text style={styles.text}>
            This certification is accepted by most employers and organizations requiring CPR training.
          </Text>
        </View>

        {/* Who Should Take This Course */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Should Take This Course</Text>
          <Text style={styles.bulletPoint}>• Teachers, coaches, and childcare providers</Text>
          <Text style={styles.bulletPoint}>• Security guards and police officers</Text>
          <Text style={styles.bulletPoint}>• Firefighters not requiring BLS certification</Text>
          <Text style={styles.bulletPoint}>• Parents, grandparents, and caregivers</Text>
          <Text style={styles.bulletPoint}>• Anyone wanting to learn life-saving skills</Text>
          <Text style={styles.bulletPoint}>• Community members and volunteers</Text>
        </View>

        {/* What to Bring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Bring</Text>
          <Text style={styles.bulletPoint}>• Comfortable clothing for floor exercises</Text>
          <Text style={styles.bulletPoint}>• Water bottle to stay hydrated</Text>
          <Text style={styles.bulletPoint}>• Notepad and pen for taking notes</Text>
          <Text style={styles.text}>
            All training materials, mannequins, and AED trainers are provided.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.contactInfo}>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📞 (555) 123-4567</Text>
              <Text style={styles.contactText}>✉️ info@lifesavercpr.com</Text>
            </View>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📍 123 Training Center Lane</Text>
              <Text style={styles.contactText}>Medical Plaza, Suite 200</Text>
              <Text style={styles.contactText}>Healthcare City, HC 12345</Text>
            </View>
          </View>
          <Text style={styles.ahaCertification}>
            American Heart Association Certified Training Center
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Class Schedule Flyer Component
export const ClassSchedulePDF = ({ classes }: { classes: Class[] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingClasses = classes
    .filter(c => parseLocalDate(c.date) >= today)
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.businessName}>LifeSaver CPR Training</Text>
            <Text style={styles.tagline}>American Heart Association Certified Instructor</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Class Schedule</Text>
        <Text style={styles.subtitle}>Upcoming CPR Training Courses</Text>

        {/* Training Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Hours</Text>
          <Text style={styles.text}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          <Text style={styles.text}>Saturday: 9:00 AM - 4:00 PM</Text>
          <Text style={styles.text}>Sunday: By Appointment</Text>
        </View>

        {/* Class Schedule Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
          
          <View style={styles.scheduleTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Course</Text>
              <Text style={styles.tableHeaderText}>Date</Text>
              <Text style={styles.tableHeaderText}>Time</Text>
              <Text style={styles.tableHeaderText}>Duration</Text>
              <Text style={styles.tableHeaderText}>Available</Text>
              <Text style={styles.tableHeaderText}>Price</Text>
            </View>
            
            {/* Table Rows */}
            {upcomingClasses.slice(0, 10).map((classItem, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCellText}>{classItem.title}</Text>
                <Text style={styles.tableCellText}>
                  {format(parseLocalDate(classItem.date), 'MMM d, yyyy')}
                </Text>
                <Text style={styles.tableCellText}>{classItem.time}</Text>
                <Text style={styles.tableCellText}>{classItem.duration}</Text>
                <Text style={styles.tableCellText}>{classItem.available}/{classItem.capacity}</Text>
                <Text style={styles.tableCellText}>${classItem.price}</Text>
              </View>
            ))}
          </View>
          
          {upcomingClasses.length === 0 && (
            <Text style={styles.text}>No upcoming classes scheduled at this time. Please contact us for scheduling information.</Text>
          )}
        </View>

        {/* Course Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Course Types</Text>
          
          <View style={styles.classGrid}>
            <View style={styles.classItem}>
              <Text style={styles.classTitle}>BLS Provider Course</Text>
              <Text style={styles.classDetail}>Duration: 4 hours</Text>
              <Text style={styles.classDetail}>Max Students: 12</Text>
              <Text style={styles.classDetail}>Target: Healthcare Professionals</Text>
              <Text style={styles.classDetail}>Includes: Adult/Child/Infant CPR, AED, Team Resuscitation</Text>
              <Text style={styles.classStatus}>Starting at $85</Text>
            </View>
            
            <View style={styles.classItem}>
              <Text style={styles.classTitle}>Heartsaver CPR</Text>
              <Text style={styles.classDetail}>Duration: 3 hours</Text>
              <Text style={styles.classDetail}>Max Students: 16</Text>
              <Text style={styles.classDetail}>Target: Community Members</Text>
              <Text style={styles.classDetail}>Includes: Adult/Child/Infant CPR, AED, Choking Relief</Text>
              <Text style={styles.classStatus}>Starting at $65</Text>
            </View>
          </View>
        </View>

        {/* Registration Information */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            Registration Required • Payment Due at Time of Registration
          </Text>
          <Text style={[styles.text, { textAlign: 'center', marginTop: 5 }]}>
            All courses include AHA certification card upon successful completion
          </Text>
        </View>

        {/* Group Training */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Training Available</Text>
          <Text style={styles.text}>
            Custom group training sessions available for organizations, businesses, and teams. 
            Contact us for special pricing and scheduling options.
          </Text>
          <Text style={styles.bulletPoint}>• On-site training available</Text>
          <Text style={styles.bulletPoint}>• Flexible scheduling</Text>
          <Text style={styles.bulletPoint}>• Group discounts available</Text>
          <Text style={styles.bulletPoint}>• Corporate training packages</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.contactInfo}>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📞 (555) 123-4567</Text>
              <Text style={styles.contactText}>✉️ info@lifesavercpr.com</Text>
            </View>
            <View style={styles.contactColumn}>
              <Text style={styles.contactText}>📍 123 Training Center Lane</Text>
              <Text style={styles.contactText}>Medical Plaza, Suite 200</Text>
              <Text style={styles.contactText}>Healthcare City, HC 12345</Text>
            </View>
          </View>
          <Text style={styles.ahaCertification}>
            American Heart Association Certified Training Center
          </Text>
        </View>
      </Page>
    </Document>
  );
};