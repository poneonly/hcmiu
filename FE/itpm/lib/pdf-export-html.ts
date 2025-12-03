// Alternative PDF export using HTML rendering for better Vietnamese support
import type { ProcessedGradesData } from './grades';
import { gradeToGpa } from './grades';

export const exportTranscriptToPDFHTML = async (gradesData: ProcessedGradesData) => {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML content with Vietnamese text
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          padding: 20px;
          font-size: 12px;
          color: rgb(0, 0, 0);
        }
        .header {
          background-color: rgb(41, 128, 185);
          color: rgb(255, 255, 255);
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          color: rgb(0, 0, 0);
        }
        .info-grid {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 8px;
          margin-bottom: 15px;
        }
        .info-label {
          font-weight: bold;
        }
        .summary-box {
          background-color: rgb(236, 240, 241);
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .semester {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .semester-header {
          background-color: rgb(52, 73, 94);
          color: rgb(255, 255, 255);
          padding: 8px 10px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background-color: rgb(41, 128, 185);
          color: rgb(255, 255, 255);
          padding: 8px;
          text-align: left;
          font-size: 10px;
        }
        td {
          padding: 6px 8px;
          border-bottom: 1px solid rgb(221, 221, 221);
          font-size: 9px;
        }
        tr:nth-child(even) {
          background-color: rgb(245, 245, 245);
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 8px;
          color: rgb(102, 102, 102);
        }
        @media print {
          .semester {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ACADEMIC TRANSCRIPT</h1>
        <p>Official Academic Record</p>
      </div>

      <div class="section">
        <div class="section-title">Student Information</div>
        <div class="info-grid">
          <div class="info-label">Student Name:</div>
          <div>${escapeHtml(gradesData.studentInfo.ten_sinh_vien)}</div>
          <div class="info-label">Student ID:</div>
          <div>${escapeHtml(gradesData.studentInfo.ma_sinh_vien)}</div>
          <div class="info-label">Faculty:</div>
          <div>${escapeHtml(gradesData.studentInfo.khoa)}</div>
          <div class="info-label">Major:</div>
          <div>${escapeHtml(gradesData.studentInfo.nganh)}</div>
          <div class="info-label">Class:</div>
          <div>${escapeHtml(gradesData.studentInfo.lop)}</div>
          <div class="info-label">Academic Year:</div>
          <div>${escapeHtml(gradesData.studentInfo.khoa_hoc)}</div>
        </div>
      </div>

      <div class="summary-box">
        <div class="section-title">Academic Summary</div>
        <div class="summary-grid">
          <div>
            <strong>Current CGPA:</strong> ${gradesData.gradeProjection.current_cgpa.toFixed(2)}<br>
            <strong>Classification:</strong> ${gradesData.gradeProjection.current_classification_en}
          </div>
          <div>
            <strong>Total Credits:</strong> ${gradesData.gradeProjection.total_credits}<br>
            <strong>Total Courses:</strong> ${gradesData.allCourses.length}
          </div>
        </div>
      </div>

      ${gradesData.semesters.map(semester => `
        <div class="semester">
          <div class="semester-header">${escapeHtml(semester.semester)}</div>
          ${semester.semesterGpa !== undefined || semester.cumulativeGpa !== undefined ? `
            <div style="margin-bottom: 10px; font-size: 10px;">
              ${semester.semesterGpa !== undefined ? `<strong>Semester GPA:</strong> ${semester.semesterGpa.toFixed(2)}` : ''}
              ${semester.cumulativeGpa !== undefined ? `<span style="margin-left: 30px;"><strong>Cumulative GPA:</strong> ${semester.cumulativeGpa.toFixed(2)}</span>` : ''}
            </div>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Score</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              ${semester.courses
            .filter(c => c.grade && c.grade !== '' && c.grade !== 'NA')
            .map(course => `
                  <tr>
                    <td>${escapeHtml(course.courseCode)}</td>
                    <td>${escapeHtml(course.courseName)}</td>
                    <td>${course.credits}</td>
                    <td>${course.score ? course.score.toFixed(1) : '-'}</td>
                    <td>${course.grade}</td>
                    <td>${gradeToGpa(course.grade).toFixed(1)}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}

      <div class="footer">
        <div>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </body>
    </html>
  `;

    // Create a temporary element to render HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    // Configure html2pdf options
    const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Transcript_${gradesData.studentInfo.ma_sinh_vien}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        // Clean up
        document.body.removeChild(element);
    }
};

// Helper function to escape HTML
function escapeHtml(text: string): string {
    if (!text) return 'N/A';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

