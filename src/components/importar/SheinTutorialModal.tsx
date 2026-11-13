"use client";

import { useState } from "react";
import { HelpCircle, X, ArrowRight, Smartphone, Share2, Copy, CheckCircle2 } from "lucide-react";

export function SheinTutorialModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
        Não sabes como tirar o link no app da SHEIN? Clica aqui (Papa Feita)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/60 backdrop-blur-sm grid place-items-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-ink-200 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-ink-400 hover:text-ink-700 p-1.5 rounded-xl hover:bg-ink-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-100 text-pink-700 uppercase tracking-wider">
                Tutorial Rápido SHEIN
              </span>
              <h3 className="text-xl font-extrabold text-ink-950 mt-2">
                Como copiar o link no aplicativo da SHEIN
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Leva apenas 5 segundos e podes colar qualquer vestido, calçado ou acessório!
              </p>
            </div>

            {/* Abas dos 3 Passos */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setStep(num as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    step === num
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                  }`}
                >
                  <span>Passo {num}</span>
                </button>
              ))}
            </div>

            {/* Conteúdo do Passo */}
            <div className="p-5 rounded-2xl bg-ink-50 border border-ink-200 text-center space-y-3 min-h-[180px] flex flex-col justify-center items-center">
              {step === 1 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 grid place-items-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    1. Abre o artigo no app da SHEIN
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    Escolhe o vestido, calçado ou produto que desejas no teu telemóvel como fazes habitualmente.
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 grid place-items-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    2. Clica no ícone de Partilha (↗️)
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    No canto superior direito da tela do produto na SHEIN, toca na setinha de partilhar ou nos três pontinhos.
                  </p>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 grid place-items-center">
                    <Copy className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    3. Toca em "Copiar Link" e cola aqui!
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    Seleciona a opção <strong>"Copiar Link"</strong>. Depois regressa aqui à ImportEasy e cola o link no simulador!
                  </p>
                </>
              )}
            </div>

            {/* Ações */}
            <div className="mt-6 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-800"
                >
                  ← Voltar
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as any)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1 transition"
                >
                  Próximo Passo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> Entendido, vou colar agora!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
