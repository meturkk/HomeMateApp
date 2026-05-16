"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { QUESTIONS } from '@/constants/questions';
import { userService } from '@/services/userService';

interface BigFiveScores {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

interface AnalysisResult {
  persona_id: number;
  scores: BigFiveScores;
}

const SCORE_LABELS: Record<string, { label: string; icon: string; color: string; description: string }> = {
  extraversion: { label: 'Dışa Dönüklük', icon: 'groups', color: '#6366f1', description: 'Sosyallik ve energy düzeyi' },
  agreeableness: { label: 'Uyumluluk', icon: 'handshake', color: '#10b981', description: 'İşbirliği ve güven eğilimi' },
  conscientiousness: { label: 'Sorumluluk', icon: 'task_alt', color: '#f59e0b', description: 'Düzen, disiplin ve güvenilirlik' },
  neuroticism: { label: 'Duygusal Denge', icon: 'psychology', color: '#ef4444', description: 'Stres ve duygusal tepki düzeyi' },
  openness: { label: 'Yeniliklere Açıklık', icon: 'lightbulb', color: '#8b5cf6', description: 'Yaratıcılık ve merak düzeyi' },
};

const PERSONA_NAMES: Record<number, { name: string; emoji: string }> = {
  0: { name: 'Uyumlu Planlayıcı', emoji: '📋' },
  1: { name: 'Sosyal Kelebek', emoji: '🦋' },
  2: { name: 'Sessiz Düşünür', emoji: '🤔' },
  3: { name: 'Enerjik Lider', emoji: '🚀' },
  4: { name: 'Özgür Ruh', emoji: '🌊' },
  5: { name: 'Düzenli Mühendis', emoji: '⚙️' },
  6: { name: 'Empatik Yardımcı', emoji: '🤝' },
  7: { name: 'Yaratıcı Kaşif', emoji: '🎨' },
  8: { name: 'Sakin Diplomat', emoji: '🕊️' },
  9: { name: 'Dinamik Vizyoner', emoji: '✨' },
};

export default function TestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Kullanıcı zaten testi çözmüşse sonuçları getir
  useEffect(() => {
    const fetchExistingAnalysis = async () => {
      try {
        const user = await userService.getMe();
        if (user && user.personaId !== null && user.personaId !== undefined && user.personaId >= 0) {
          const details = await userService.getPersonaDetails(user.personaId);
          if (details) {
            setAnalysisResult({
              persona_id: details.persona_id,
              scores: details.scores
            });
          }
        }
      } catch (err) {
        console.error('Mevcut kişilik analizi yüklenemedi:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingAnalysis();
  }, []);

  const progress = Math.round(((currentStep) / QUESTIONS.length) * 100);
  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const isFinished = currentStep === QUESTIONS.length;

  const handleSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [`q${currentStep + 1}`]: value }));
  };

  const handleNext = () => {
    if (answers[`q${currentStep + 1}`]) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await userService.submitPersonalityTest(answers);
      console.log('AI Yanıtı:', JSON.stringify(result, null, 2));
      
      // Yanıt yapısını doğrula ve normalize et
      const analysisData: AnalysisResult = {
        persona_id: result.persona_id ?? 0,
        scores: result.scores ?? {
          extraversion: 50,
          agreeableness: 50,
          conscientiousness: 50,
          neuroticism: 50,
          openness: 50,
        }
      };
      setAnalysisResult(analysisData);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Bir hata oluştu. Lütfen giriş yaptığınızdan emin olun.");
      if (error.message && (error.message.includes("403") || error.message.includes("401"))) {
        router.push('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnalysisResult(null);
    setCurrentStep(0);
    setAnswers({});
  };

  // Yükleniyor Ekranı
  if (isLoading) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-md"></div>
        <p className="font-body-lg text-on-surface-variant">Analizler yükleniyor...</p>
      </div>
    );
  }

  // Sonuç Ekranı
  if (analysisResult) {
    const persona = PERSONA_NAMES[analysisResult.persona_id] || { name: `Persona ${analysisResult.persona_id}`, emoji: '🧠' };
    const scores = analysisResult.scores;

    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg flex flex-col items-center">
        {/* Başlık */}
        <div className="text-center mb-lg">
          <div style={{ fontSize: '64px', lineHeight: '1' }} className="mb-sm">{persona.emoji}</div>
          <h1 className="font-display-sm text-on-surface mb-xs">Kişilik Analizin Hazır!</h1>
          <p className="font-body-lg text-on-surface-variant">Yapay zeka algoritmamız seni analiz etti.</p>
        </div>

        {/* Persona Kartı */}
        <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow p-lg mb-lg" style={{ maxWidth: '640px' }}>
          <div className="text-center mb-lg">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Kişilik Tipin</p>
            <h2 className="font-headline-lg text-primary">{persona.emoji} {persona.name}</h2>
            <p className="font-body-md text-on-surface-variant mt-xs">Persona #{analysisResult.persona_id}</p>
          </div>

          {/* Big Five Skorları */}
          <div className="flex flex-col gap-md">
            {Object.entries(SCORE_LABELS).map(([key, meta]) => {
              const score = scores[key as keyof BigFiveScores];
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="font-label-md text-on-surface">{meta.label}</span>
                    </div>
                    <span className="font-label-md" style={{ color: meta.color }}>%{score.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full" style={{ height: '10px' }}>
                    <div 
                      className="rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${score}%`, 
                        height: '10px',
                        backgroundColor: meta.color,
                      }} 
                    />
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-wrap gap-md justify-center">
          <button
            onClick={() => router.push('/profile')}
            className="font-label-md bg-primary text-on-primary px-xl py-md rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined">person</span>
            Profilime Git
          </button>
          
          <button
            onClick={handleRetake}
            className="font-label-md bg-secondary-container text-on-secondary-container px-xl py-md rounded-xl hover:bg-opacity-90 transition-colors flex items-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Testi Yeniden Çöz
          </button>

          <button
            onClick={() => router.push('/')}
            className="font-label-md bg-surface-container text-on-surface px-xl py-md rounded-xl hover:bg-surface-container-high transition-colors border border-outline-variant/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">home</span>
            Ana Sayfa
          </button>
        </div>
      </div>
    );
  }

  // Testi Tamamla Ekranı
  if (isFinished) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm text-center">Harika, Tüm Soruları Yanıtladın!</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg text-center w-full max-w-[600px]">
          Verdiğin cevaplara göre senin için en uyumlu ev arkadaşı profilini yapay zeka algoritmamız ile hesaplıyoruz.
        </p>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="font-label-md text-label-md bg-primary text-on-primary px-xl py-md rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full"></div>
              Yapay Zeka Analiz Ediyor...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">magic_button</span>
              Kişiliğimi Belirle ve Kaydet
            </>
          )}
        </button>
      </div>
    );
  }

  const currentAnswer = answers[`q${currentStep + 1}`];

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg flex flex-col items-center">
      {/* Header & Progress */}
      <div className="w-full max-w-2xl text-center mb-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">Kişilik Testi</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">Sana en uygun ev arkadaşını bulmamız için bu testi tamamla.</p>
        
        <div className="flex flex-col gap-xs w-full">
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>Soru {currentStep + 1} / {QUESTIONS.length}</span>
            <span>%{progress} Tamamlandı</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Question Canvas */}
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg flex flex-col gap-lg">
        <div className="text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{currentQuestion}</h2>
        </div>

        {/* Likert Scale */}
        <div className="flex flex-col gap-sm">
          {[
            { val: 1, label: "Kesinlikle Katılmıyorum" },
            { val: 2, label: "Katılmıyorum" },
            { val: 3, label: "Kararsızım" },
            { val: 4, label: "Katılıyorum" },
            { val: 5, label: "Kesinlikle Katılıyorum" }
          ].map((opt) => {
            const isSelected = currentAnswer === opt.val;
            return (
              <label 
                key={opt.val} 
                className={`group relative flex items-center p-md border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-primary-fixed border-primary" 
                    : "bg-surface border-outline-variant hover:border-primary"
                }`}
              >
                <input 
                  type="radio" 
                  name={`q${currentStep}`} 
                  value={opt.val} 
                  checked={isSelected}
                  onChange={() => handleSelect(opt.val)}
                  className="absolute opacity-0 w-0 h-0" 
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-md flex items-center justify-center ${
                  isSelected ? "border-primary" : "border-outline-variant group-hover:border-primary"
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-primary" : "bg-transparent"}`}></div>
                </div>
                <span className={`font-body-lg text-body-lg text-on-surface ${isSelected ? "font-medium" : ""}`}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-md">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="font-label-md text-label-md text-primary flex items-center gap-xs px-md py-sm rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Önceki Soru
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!currentAnswer}
            className="font-label-md text-label-md bg-primary text-on-primary flex items-center gap-xs px-md py-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            {isLastQuestion ? "Bitir" : "Sonraki Soru"}
            <span className="material-symbols-outlined">
              {isLastQuestion ? "done" : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
