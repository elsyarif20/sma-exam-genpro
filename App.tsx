
import React, { useState, useEffect } from 'react';
import { ExamType, ExamData, GenerateParams } from './types';
import { generateExamContent } from './services/geminiService';
import { exportToWord } from './utils/wordExport';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Table as TableIcon, 
  Search, 
  CheckCircle, 
  ClipboardList, 
  Info, 
  Monitor, 
  Layout, 
  BarChart3,
  Edit3,
  ListFilter
} from 'lucide-react';

type TabType = 'soal' | 'kisi-kisi' | 'analisis' | 'pembahasan';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('soal');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isManualSubject, setIsManualSubject] = useState(false);
  
  const [params, setParams] = useState<GenerateParams>({
    subject: 'Matematika',
    examType: ExamType.TRYOUT_1,
    difficulty: 'Sedang',
    referenceContent: ''
  });

  const subjects = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 
    'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi', 'Geografi', 
    'Sejarah', 'Informatika', 'PPKn', 'Seni Budaya', 'PJOK'
  ];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleGenerate = async () => {
    if (!params.subject.trim()) {
      setError('Mata pelajaran tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateExamContent(params);
      setExamData(data);
    } catch (err: any) {
      console.error(err);
      setError('Gagal membuat soal. Pastikan koneksi internet stabil dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!examData) return;
    try {
      await exportToWord(examData);
    } catch (err) {
      setError('Gagal mengekspor file Word.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                SMA ExamGen Pro
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter -mt-1">Windows Edition v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm"
              >
                <Monitor size={14} />
                Install ke Desktop
              </button>
            )}
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck size={16} />
                <span>Verified AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Layout className="text-indigo-600" size={20} />
                Menu Navigasi
              </h2>
              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">READY</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Mata Pelajaran</label>
                  <button 
                    onClick={() => setIsManualSubject(!isManualSubject)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                  >
                    {isManualSubject ? <><ListFilter size={10} /> Pilih List</> : <><Edit3 size={10} /> Tulis Manual</>}
                  </button>
                </div>
                
                {isManualSubject ? (
                  <input 
                    type="text"
                    placeholder="Contoh: Astronomi, Tata Boga, dll"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                    value={params.subject}
                    onChange={(e) => setParams({...params, subject: e.target.value})}
                  />
                ) : (
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                    value={params.subject}
                    onChange={(e) => setParams({...params, subject: e.target.value})}
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Ujian</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                  value={params.examType}
                  onChange={(e) => setParams({...params, examType: e.target.value as ExamType})}
                >
                  {Object.values(ExamType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Kesulitan</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mudah', 'Sedang', 'Sulit', 'HOTS'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setParams({...params, difficulty: level as any})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        params.difficulty === level 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList size={16} className="text-indigo-500" />
                    Input Materi Manual
                  </div>
                </label>
                <div className="relative group">
                  <textarea 
                    rows={6}
                    placeholder="Tulis atau tempelkan materi di sini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none placeholder:text-slate-400"
                    value={params.referenceContent}
                    onChange={(e) => setParams({...params, referenceContent: e.target.value})}
                  />
                  {!params.referenceContent && (
                    <div className="absolute inset-x-0 bottom-4 px-4 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity">
                      <div className="flex items-start gap-2 text-[11px] text-slate-500 italic">
                        <Info size={12} className="shrink-0 mt-0.5" />
                        <p>AI akan otomatis menyesuaikan dengan kurikulum SMA terkini jika bagian ini kosong.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                disabled={loading}
                onClick={handleGenerate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'Sedang Memproses...' : 'Mulai Generate Soal'}
              </button>
            </div>
          </section>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 text-rose-700 text-sm">
              <AlertCircle className="shrink-0" size={18} />
              <p>{error}</p>
            </div>
          )}
        </aside>

        <section className="lg:col-span-8 space-y-6">
          {!examData && !loading && (
            <div className="bg-white rounded-2xl border border-slate-200 h-[700px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <BarChart3 className="text-slate-200" size={64} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sistem Analisis Siap</h3>
              <p className="text-slate-500 max-w-sm mb-6">
                Pilih konfigurasi untuk menghasilkan paket soal beserta kisi-kisi dan analisis kualitatif mendalam per soal.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 h-[700px] flex flex-col items-center justify-center text-center p-8 space-y-4 shadow-sm">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={64} />
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-bold text-slate-800">Menyusun Naskah Ujian...</h3>
                <p className="text-slate-500">AI sedang memvalidasi konstruksi soal, validitas isi, dan penggunaan bahasa standar pendidikan.</p>
              </div>
            </div>
          )}

          {examData && !loading && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
                  {[
                    { id: 'soal', label: 'Soal', icon: FileText },
                    { id: 'kisi-kisi', label: 'Kisi-kisi', icon: TableIcon },
                    { id: 'analisis', label: 'Analisis', icon: Search },
                    { id: 'pembahasan', label: 'Pembahasan', icon: CheckCircle2 }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                >
                  <Download size={20} /> Export (.docx)
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                <div className="bg-slate-50 border-b border-slate-200 p-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-800">{examData.title}</h3>
                  <p className="text-slate-500 font-medium">{examData.subject} • {examData.grade}</p>
                </div>

                <div className="p-8">
                  {activeTab === 'soal' && (
                    <div className="space-y-10">
                      {examData.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-4">
                          <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-wide">
                            {section.title}
                          </h4>
                          <div className="space-y-6">
                            {section.questions.map((q, qIdx) => (
                              <div key={q.id} className="space-y-2">
                                <p className="text-slate-800 font-medium leading-relaxed">
                                  <span className="text-slate-400 mr-2">{qIdx + 1}.</span> {q.text}
                                </p>
                                {q.options && q.options.length > 0 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-6">
                                    {q.options.map((opt, oIdx) => (
                                      <p key={oIdx} className="text-sm text-slate-600 flex gap-2">
                                        <span className="font-bold text-indigo-600">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'kisi-kisi' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-y border-slate-200">
                            <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center">No</th>
                            <th className="px-4 py-3 font-bold text-slate-700">Indikator Soal</th>
                            <th className="px-4 py-3 font-bold text-slate-700">Materi</th>
                            <th className="px-4 py-3 font-bold text-slate-700 w-20 text-center">Kognitif</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examData.sections.flatMap(s => s.questions).map((q, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-center text-slate-500 font-medium">{i + 1}</td>
                              <td className="px-4 py-3 text-slate-700">{q.competency}</td>
                              <td className="px-4 py-3 text-slate-700">{q.material}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${q.cognitiveLevel.includes('L3') ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {q.cognitiveLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'analisis' && (
                    <div className="space-y-10">
                      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
                        <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                          <Info size={18} /> Ringkasan Analisis Paket Soal
                        </h4>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                          {examData.qualitativeAnalysis}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                          <TableIcon size={20} className="text-indigo-600" /> Analisis Kualitatif per Soal
                        </h4>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-4 font-bold text-slate-700 w-16 text-center">No</th>
                                <th className="px-4 py-4 font-bold text-slate-700">Validitas Isi</th>
                                <th className="px-4 py-4 font-bold text-slate-700">Konstruksi</th>
                                <th className="px-4 py-4 font-bold text-slate-700">Bahasa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {examData.questionAnalyses.map((qa, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-4 text-center font-bold text-slate-400">{qa.questionNo}</td>
                                  <td className="px-4 py-4 text-slate-600 italic">"{qa.validity}"</td>
                                  <td className="px-4 py-4 text-slate-600 italic">"{qa.construction}"</td>
                                  <td className="px-4 py-4 text-slate-600 italic">"{qa.language}"</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pembahasan' && (
                    <div className="space-y-8">
                      {examData.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                          <h4 className="font-bold text-indigo-700 border-b border-indigo-100 pb-2 uppercase tracking-widest text-xs">{section.title}</h4>
                          <div className="space-y-6">
                            {section.questions.map((q, qIdx) => (
                              <div key={q.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <p className="font-bold text-slate-800 text-sm">Butir Soal {qIdx + 1}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">KUNCI:</span>
                                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">{q.answer}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200/50 shadow-sm">
                                  <span className="font-bold text-indigo-600 block mb-1 text-[10px] tracking-widest">PEMBAHASAN:</span>
                                  {q.discussion}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center py-10 opacity-40 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        SMA ExamGen Pro Windows Edition • All Rights Reserved &copy; 2024
      </footer>
    </div>
  );
};

export default App;
