// @ts-ignore - jsPDF types may not be available
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable types may not be available
import autoTable from 'jspdf-autotable';
import type { ProcessedGradesData, GradeRecord } from './grades';
import { gradeToGpa } from './grades';

/**
 * IMPORTANT: jsPDF's default fonts (Helvetica, Times, Courier) do NOT support Vietnamese characters.
 * Vietnamese text will be encoded in UTF-8 but may display as boxes or incorrect characters.
 * 
 * To properly support Vietnamese:
 * 1. Add a Vietnamese-supporting font (e.g., Arial Unicode MS, DejaVu Sans) to jsPDF
 * 2. Or use html2pdf.js which handles Unicode better
 * 3. Or use html2canvas + jsPDF to render HTML with Vietnamese text
 * 
 * For now, the text is properly encoded but may not display correctly without a custom font.
 */

// Helper function to split text into lines that fit within width
const splitText = (doc: any, text: string, maxWidth: number): string[] => {
    if (!text) return [''];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = doc.getTextWidth(testLine);

        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
};

// Helper function to add Vietnamese text
// jsPDF handles UTF-8, but Vietnamese diacritics may not render correctly with default fonts
// We'll use the text method which should work for most cases
const addVietnameseText = (doc: any, text: string, x: number, y: number, options?: any) => {
    if (!text) {
        doc.text('N/A', x, y, options);
        return 1;
    }

    try {
        // Split long text into multiple lines if needed
        const maxWidth = options?.maxWidth || (doc.internal.pageSize.getWidth() - x - 10);
        const lines = splitText(doc, text, maxWidth);

        lines.forEach((line, index) => {
            // jsPDF text method handles UTF-8, but Vietnamese may show as boxes with default fonts
            // The text will be in the PDF but may not display correctly without a Vietnamese font
            doc.text(line, x, y + (index * 5), options);
        });

        return lines.length;
    } catch (error) {
        // Fallback: render as-is
        doc.text(text, x, y, options);
        return 1;
    }
};

export const exportTranscriptToPDF = (gradesData: ProcessedGradesData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Colors
    const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
    const headerColor: [number, number, number] = [52, 73, 94]; // Dark gray
    const lightGray: [number, number, number] = [236, 240, 241];

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Academic Record', pageWidth / 2, 30, { align: 'center' });

    yPos = 50;

    // Student Information Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const studentInfo = [
        ['Student Name:', gradesData.studentInfo.ten_sinh_vien],
        ['Student ID:', gradesData.studentInfo.ma_sinh_vien],
        ['Faculty:', gradesData.studentInfo.khoa],
        ['Major:', gradesData.studentInfo.nganh],
        ['Class:', gradesData.studentInfo.lop],
        ['Academic Year:', gradesData.studentInfo.khoa_hoc],
    ];

    studentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        // Use html method for Vietnamese text support
        const valueText = value || 'N/A';
        const lines = addVietnameseText(doc, valueText, margin + 50, yPos, { maxWidth: 120 });
        yPos += lines * 6;
    });

    yPos += 5;

    // Summary Statistics
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 25, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Summary', margin + 5, yPos + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const totalCredits = gradesData.gradeProjection.total_credits;
    const cgpa = gradesData.gradeProjection.current_cgpa;
    const classification = gradesData.gradeProjection.current_classification_en;
    const totalCourses = gradesData.allCourses.length;

    doc.text(`Current CGPA: ${cgpa.toFixed(2)}`, margin + 5, yPos + 12);
    doc.text(`Classification: ${classification}`, margin + 5, yPos + 18);
    doc.text(`Total Credits: ${totalCredits}`, margin + 100, yPos + 12);
    doc.text(`Total Courses: ${totalCourses}`, margin + 100, yPos + 18);

    yPos += 35;

    // Grades by Semester
    gradesData.semesters.forEach((semester, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = margin;
        }

        // Semester Header
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        // Use html method for Vietnamese semester names
        const semesterLines = addVietnameseText(doc, semester.semester, margin + 5, yPos + 2, { maxWidth: 170 });
        if (semesterLines > 1) {
            yPos += (semesterLines - 1) * 5;
        }

        yPos += 8;

        // Semester GPA
        if (semester.semesterGpa !== undefined || semester.cumulativeGpa !== undefined) {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            if (semester.semesterGpa !== undefined) {
                doc.text(`Semester GPA: ${semester.semesterGpa.toFixed(2)}`, margin + 5, yPos);
            }
            if (semester.cumulativeGpa !== undefined) {
                doc.text(`Cumulative GPA: ${semester.cumulativeGpa.toFixed(2)}`, margin + 100, yPos);
            }
            yPos += 5;
        }

        // Courses Table
        const courses = semester.courses.filter(c => c.grade && c.grade !== '' && c.grade !== 'NA');

        if (courses.length > 0) {
            const tableData = courses.map(course => {
                // Ensure Vietnamese text is properly handled in table cells
                return [
                    course.courseCode || '',
                    course.courseName || '',
                    course.credits.toString(),
                    course.score ? course.score.toFixed(1) : '-',
                    course.grade || '',
                    gradeToGpa(course.grade).toFixed(1),
                ];
            });

            autoTable(doc, {
                startY: yPos,
                head: [['Code', 'Course Name', 'Credits', 'Score', 'Grade', 'GPA']],
                body: tableData,
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9,
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [0, 0, 0],
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                columnStyles: {
                    0: { cellWidth: 25 }, // Code
                    1: { cellWidth: 80, cellPadding: { left: 2, right: 2, top: 2, bottom: 2 } }, // Course Name - more padding for Vietnamese text
                    2: { cellWidth: 20 }, // Credits
                    3: { cellWidth: 20 }, // Score
                    4: { cellWidth: 20 }, // Grade
                    5: { cellWidth: 20 }, // GPA
                },
                styles: {
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap',
                },
                didParseCell: function (data: any) {
                    // Ensure Vietnamese characters are properly rendered
                    if (data.column.index === 1) { // Course Name column
                        data.cell.text = data.cell.text || [];
                    }
                },
            });

            yPos = (doc as any).lastAutoTable.finalY + 5;
        } else {
            yPos += 5;
        }
    });

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            `Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
        );
    }

    // Generate filename
    const studentId = gradesData.studentInfo.ma_sinh_vien;
    const filename = `Transcript_${studentId}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save PDF
    doc.save(filename);
};

