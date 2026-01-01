import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PDFExporterProps {
  formData: any;
  imageUrl: string;
  description?: string;
  costEstimationData?: any;
  exteriorViews?: { [key: string]: string };
  interiorViews?: { [key: string]: string };
}

export default function PDFExporter({
  formData,
  imageUrl,
  description,
  costEstimationData,
  exteriorViews = {},
  interiorViews = {}
}: PDFExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    toast.info('Generating PDF... This may take a moment.');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Title Page
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CasaMuse', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Design Summary Report', pageWidth / 2, 38, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 65;

      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Design Inputs Section
      pdf.setTextColor(79, 70, 229);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Design Specifications', margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(79, 70, 229);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const specs = [
        ['Land Area', `${formData.landArea} sq ft`],
        ['Architectural Style', formData.preferences?.style || 'Modern'],
        ['Number of Floors', String(formData.preferences?.floors || 1)],
        ['Vastu Compliant', formData.preferences?.vastuCompliant ? 'Yes' : 'No']
      ];

      specs.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${label}:`, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 45, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Rooms
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rooms:', margin, yPosition);
      yPosition += 7;
      pdf.setFont('helvetica', 'normal');

      formData.rooms?.forEach((room: any) => {
        const roomText = `• ${room.count}x ${room.roomName} (${room.width}'×${room.height}')${room.attachedBathroom ? ' + Bathroom' : ''}`;
        pdf.text(roomText, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Floor Plan Image
      checkNewPage(100);
      pdf.setTextColor(79, 70, 229);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Generated Floor Plan', margin, yPosition);
      yPosition += 8;
      pdf.setDrawColor(79, 70, 229);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      try {
        const floorPlanImg = await loadImage(imageUrl);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (floorPlanImg.height / floorPlanImg.width) * imgWidth;
        
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.addImage(floorPlanImg, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 120));
        yPosition += Math.min(imgHeight, 120) + 10;
      } catch (e) {
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(10);
        pdf.text('Floor plan image could not be loaded', margin, yPosition);
        yPosition += 10;
      }

      if (description) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        const splitDescription = pdf.splitTextToSize(description, pageWidth - (margin * 2));
        pdf.text(splitDescription, margin, yPosition);
        yPosition += splitDescription.length * 5 + 10;
      }

      // Exterior Views
      if (Object.keys(exteriorViews).length > 0) {
        pdf.addPage();
        yPosition = margin;
        
        pdf.setTextColor(79, 70, 229);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Rendered Exterior Views', margin, yPosition);
        yPosition += 8;
        pdf.setDrawColor(79, 70, 229);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        for (const [viewName, viewUrl] of Object.entries(exteriorViews)) {
          checkNewPage(70);
          try {
            const viewImg = await loadImage(viewUrl);
            const imgWidth = (pageWidth - (margin * 3)) / 2;
            const imgHeight = (viewImg.height / viewImg.width) * imgWidth;
            pdf.addImage(viewImg, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 60));
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.text(viewName.charAt(0).toUpperCase() + viewName.slice(1) + ' View', margin, yPosition + Math.min(imgHeight, 60) + 5);
            yPosition += Math.min(imgHeight, 60) + 15;
          } catch (e) {
            console.error(`Failed to load exterior view: ${viewName}`);
          }
        }
      }

      // Interior Views
      if (Object.keys(interiorViews).length > 0) {
        pdf.addPage();
        yPosition = margin;
        
        pdf.setTextColor(79, 70, 229);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Rendered Interior Views', margin, yPosition);
        yPosition += 8;
        pdf.setDrawColor(79, 70, 229);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        for (const [roomName, viewUrl] of Object.entries(interiorViews)) {
          checkNewPage(70);
          try {
            const viewImg = await loadImage(viewUrl);
            const imgWidth = (pageWidth - (margin * 3)) / 2;
            const imgHeight = (viewImg.height / viewImg.width) * imgWidth;
            pdf.addImage(viewImg, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 60));
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.text(roomName, margin, yPosition + Math.min(imgHeight, 60) + 5);
            yPosition += Math.min(imgHeight, 60) + 15;
          } catch (e) {
            console.error(`Failed to load interior view: ${roomName}`);
          }
        }
      }

      // Cost Estimation Section
      if (costEstimationData?.summary) {
        pdf.addPage();
        yPosition = margin;
        
        pdf.setTextColor(79, 70, 229);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cost Estimation Summary', margin, yPosition);
        yPosition += 8;
        pdf.setDrawColor(79, 70, 229);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;

        // Main cost highlight
        pdf.setFillColor(79, 70, 229, 0.1);
        pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 25, 3, 3, 'F');
        
        pdf.setTextColor(79, 70, 229);
        pdf.setFontSize(12);
        pdf.text('Total Estimated Cost', pageWidth / 2, yPosition + 8, { align: 'center' });
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(costEstimationData.summary.totalCost), pageWidth / 2, yPosition + 20, { align: 'center' });
        yPosition += 35;

        // Cost breakdown
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cost Breakdown:', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const breakdown = costEstimationData.summary.breakdown;
        const breakdownItems = [
          ['Cost per Sq Ft', formatCurrency(costEstimationData.summary.costPerSqFt)],
          ['Civil/Structural Work', formatCurrency(breakdown?.civil || 0)],
          ['Interior Work', formatCurrency(breakdown?.interior || 0)],
          ['Exterior Work', formatCurrency(breakdown?.exterior || 0)],
          ['Labor', formatCurrency(breakdown?.labor || 0)],
          ['Electrical', formatCurrency(breakdown?.electrical || 0)],
          ['Plumbing', formatCurrency(breakdown?.plumbing || 0)],
          ['Build Time', costEstimationData.summary.buildTime || '9-12 months']
        ];

        breakdownItems.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'normal');
          pdf.text(label, margin + 5, yPosition);
          pdf.text(value, pageWidth - margin - 5, yPosition, { align: 'right' });
          yPosition += 7;
        });

        // Land cost if available
        if (costEstimationData.summary.landCost) {
          yPosition += 5;
          pdf.setFont('helvetica', 'bold');
          pdf.text('Land Cost', margin + 5, yPosition);
          pdf.text(formatCurrency(costEstimationData.summary.landCost), pageWidth - margin - 5, yPosition, { align: 'right' });
          yPosition += 7;
        }

        // Construction cost if available
        if (costEstimationData.summary.constructionCost) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Construction Cost', margin + 5, yPosition);
          pdf.text(formatCurrency(costEstimationData.summary.constructionCost), pageWidth - margin - 5, yPosition, { align: 'right' });
          yPosition += 7;
        }
      }

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `CasaMuse Design Report | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Save the PDF
      pdf.save('CasaMuse-Design-Summary.pdf');
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={generatePDF} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}
