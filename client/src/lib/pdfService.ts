import { pdf } from '@react-pdf/renderer';
import { BLSFlyerPDF, HeartsaverFlyerPDF, ClassSchedulePDF } from '@/components/pdf/PDFFlyers';
import { Class } from '@shared/schema';

export class PDFService {
  private static async downloadPDF(pdfComponent: React.ReactElement, filename: string) {
    try {
      // Generate the PDF blob
      const blob = await pdf(pdfComponent).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error generating PDF:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async downloadBLSFlyer(classes: Class[]) {
    const pdfComponent = BLSFlyerPDF({ classes });
    const filename = `BLS-Course-Flyer-${new Date().toISOString().split('T')[0]}.pdf`;
    return await this.downloadPDF(pdfComponent, filename);
  }

  static async downloadHeartsaverFlyer(classes: Class[]) {
    const pdfComponent = HeartsaverFlyerPDF({ classes });
    const filename = `Heartsaver-Course-Flyer-${new Date().toISOString().split('T')[0]}.pdf`;
    return await this.downloadPDF(pdfComponent, filename);
  }

  static async downloadClassSchedule(classes: Class[]) {
    const pdfComponent = ClassSchedulePDF({ classes });
    const filename = `Class-Schedule-${new Date().toISOString().split('T')[0]}.pdf`;
    return await this.downloadPDF(pdfComponent, filename);
  }
}

// Utility function for fetching classes data
export const fetchClassesForPDF = async (): Promise<Class[]> => {
  try {
    const response = await fetch('/api/classes');
    const data = await response.json();
    
    if (data.success && data.classes) {
      return data.classes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching classes for PDF:', error);
    return [];
  }
};