"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { QUESTIONS } from '@/constants/questions';
import { userService } from '@/services/userService';

export default function TestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await userService.submitPersonalityTest(answers);
      alert("Test başarıyla tamamlandı! Kişilik analiziniz sisteme kaydedildi.");
      router.push('/');
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
            <>Analiz Ediliyor...</>
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
