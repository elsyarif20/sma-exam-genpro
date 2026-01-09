
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import FileSaver from "file-saver";
import { ExamData } from "../types";

export const exportToWord = async (exam: ExamData) => {
  const children: any[] = [
    // Header
    new Paragraph({
      text: "PEMERINTAH PROVINSI DINAS PENDIDIKAN",
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: "SATUAN PENDIDIKAN SMA NEGERI GENERATOR PRO",
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: "TAHUN PELAJARAN 2024/2025",
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: exam.title.toUpperCase(), bold: true, size: 28 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({ text: `Mata Pelajaran: ${exam.subject} | Kelas: ${exam.grade}`, bold: true }),
      ],
    }),

    // --- SECTION 1: KISI-KISI ---
    new Paragraph({
      text: "KISI-KISI PENULISAN SOAL",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "No", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Kompetensi/Indikator", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Materi", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Level", bold: true })] }),
          ],
        }),
        ...exam.sections.flatMap(s => s.questions.map((q, i) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${i + 1}`)] }),
            new TableCell({ children: [new Paragraph(q.competency)] }),
            new TableCell({ children: [new Paragraph(q.material)] }),
            new TableCell({ children: [new Paragraph(q.cognitiveLevel)] }),
          ],
        }))),
      ],
    }),

    // --- SECTION 2: ANALISIS KUALITATIF ---
    new Paragraph({
      text: "ANALISIS KUALITATIF PAKET SOAL",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
    }),
    new Paragraph({
      text: "1. RINGKASAN UMUM",
      bold: true,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: exam.qualitativeAnalysis,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "2. ANALISIS BUTIR SOAL",
      bold: true,
      spacing: { before: 200, after: 200 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "No", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Validitas Isi", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Konstruksi", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Bahasa", bold: true })] }),
          ],
        }),
        ...exam.questionAnalyses.map((qa) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${qa.questionNo}`)] }),
            new TableCell({ children: [new Paragraph(qa.validity)] }),
            new TableCell({ children: [new Paragraph(qa.construction)] }),
            new TableCell({ children: [new Paragraph(qa.language)] }),
          ],
        })),
      ],
    }),

    // --- SECTION 3: SOAL ---
    new Paragraph({
      text: "LEMBAR SOAL",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
    }),
  ];

  exam.sections.forEach((section) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ text: section.title, bold: true, underline: {} }),
        ],
      }),
      new Paragraph({
        text: section.description,
        italics: true,
        spacing: { after: 200 },
      })
    );

    section.questions.forEach((q, index) => {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: `${index + 1}. ${q.text}` }),
          ],
        })
      );

      if (q.options && q.options.length > 0) {
        const labels = ["A", "B", "C", "D", "E"];
        q.options.forEach((opt, optIdx) => {
          children.push(
            new Paragraph({
              indent: { left: 720 },
              children: [
                new TextRun({ text: `${labels[optIdx]}. ${opt}` }),
              ],
            })
          );
        });
      }
    });
  });

  // --- SECTION 4: KUNCI & PEMBAHASAN ---
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 1000, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "KUNCI JAWABAN DAN PEMBAHASAN", bold: true, break: 1 })],
    })
  );

  exam.sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: section.title,
        bold: true,
        spacing: { before: 200 },
      })
    );
    section.questions.forEach((q, index) => {
      children.push(
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: `${index + 1}. Jawaban: ${q.answer}`, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Pembahasan: ", italics: true, bold: true }),
            new TextRun({ text: q.discussion }),
          ],
          indent: { left: 360 },
        })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.NEXT_PAGE,
        },
        children: children,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const saveAsFunc = (FileSaver as any).saveAs || (FileSaver as any).default?.saveAs || (FileSaver as any).default || FileSaver;
    
    if (typeof saveAsFunc === 'function') {
      saveAsFunc(blob, `${exam.title.replace(/\s+/g, "_")}_${exam.subject}.docx`);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exam.title.replace(/\s+/g, "_")}_${exam.subject}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw error;
  }
};
