
import { GoogleGenAI, Type } from "@google/genai";
import { ExamData, GenerateParams } from "../types";

export const generateExamContent = async (params: GenerateParams): Promise<ExamData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const referencePrompt = params.referenceContent 
    ? `BERDASARKAN MATERI BERIKUT:\n---\n${params.referenceContent}\n---\nGunakkan materi di atas sebagai sumber utama pembuatan soal.`
    : `Gunakan kurikulum standar SMA untuk mata pelajaran ini sebagai sumber materi.`;

  const prompt = `
    Buatkan paket soal lengkap untuk tingkat SMA dengan rincian berikut:
    Mata Pelajaran: ${params.subject}
    Jenis Ujian: ${params.examType}
    Tingkat Kesulitan: ${params.difficulty}
    
    ${referencePrompt}

    JUMLAH SOAL WAJIB:
    1. 30 Soal Pilihan Ganda (PG) Biasa.
    2. 10 Soal Pilihan Ganda (PG) TKA (Tes Kemampuan Akademik / HOTS).
    3. 3 Soal Essay Biasa.
    4. 2 Soal Essay TKA (Analitis/HOTS).
    
    SETIAP SOAL HARUS MEMILIKI:
    - Kompetensi Dasar/Indikator Soal (Competency)
    - Materi (Material)
    - Level Kognitif (L1/L2/L3)
    - Kunci Jawaban
    - Pembahasan Lengkap dan Mendalam (Discussion)
    
    ATURAN PENULISAN MATEMATIKA/SAINS:
    - JANGAN gunakan tanda caret (^) untuk pangkat.
    - GUNAKAN karakter Unicode superscript (contoh: ², ³, ⁴, ⁿ) untuk penulisan pangkat atau eksponen.
    
    ANALISIS KUALITATIF:
    1. Berikan Analisis Kualitatif UMUM (qualitativeAnalysis) mengenai paket soal secara keseluruhan.
    2. Berikan Analisis Kualitatif PER SOAL (questionAnalyses) untuk SEMUA soal yang dibuat, mencakup:
       - Validitas Isi (Kesesuaian dengan indikator/materi)
       - Konstruksi (Kejelasan stem dan homogenitas pengecoh)
       - Bahasa (Kesesuaian PUEBI dan ketidakambiguan)

    Gunakan Bahasa Indonesia formal sesuai PUEBI dan kurikulum terbaru.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subject: { type: Type.STRING },
          grade: { type: Type.STRING },
          qualitativeAnalysis: { type: Type.STRING, description: "Analisis kualitatif paket soal secara umum." },
          questionAnalyses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionNo: { type: Type.NUMBER },
                validity: { type: Type.STRING },
                construction: { type: Type.STRING },
                language: { type: Type.STRING }
              },
              required: ["questionNo", "validity", "construction", "language"]
            }
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING }
                      },
                      answer: { type: Type.STRING },
                      discussion: { type: Type.STRING },
                      cognitiveLevel: { type: Type.STRING },
                      material: { type: Type.STRING },
                      competency: { type: Type.STRING }
                    },
                    required: ["id", "text", "answer", "discussion", "cognitiveLevel", "material", "competency"]
                  }
                }
              },
              required: ["title", "description", "questions"]
            }
          }
        },
        required: ["title", "subject", "grade", "qualitativeAnalysis", "questionAnalyses", "sections"]
      }
    }
  });

  return JSON.parse(response.text);
};
