
export enum ExamType {
  TRYOUT_1 = 'Try Out 1',
  TRYOUT_2 = 'Try Out 2',
  TRYOUT_3 = 'Try Out 3',
  TRYOUT_4 = 'Try Out 4',
  TRYOUT_5 = 'Try Out 5',
  UJIAN_SEKOLAH = 'Ujian Sekolah'
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; // For PG
  answer: string;
  discussion: string; // Pembahasan
  cognitiveLevel: string; // L1, L2, L3 (HOTS)
  material: string; // Materi
  competency: string; // Kompetensi Dasar/Indikator Soal
}

export interface QuestionAnalysis {
  questionNo: number;
  validity: string; // Validitas Isi
  construction: string; // Konstruksi Soal
  language: string; // Penggunaan Bahasa
}

export interface ExamSection {
  title: string;
  description: string;
  questions: Question[];
}

export interface ExamData {
  title: string;
  subject: string;
  grade: string;
  qualitativeAnalysis: string; // Analisis Kualitatif Umum
  questionAnalyses: QuestionAnalysis[]; // Analisis Kualitatif per Soal
  sections: ExamSection[];
}

export interface GenerateParams {
  subject: string;
  examType: ExamType;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit' | 'HOTS';
  referenceContent?: string; // New field for user-provided material
}
