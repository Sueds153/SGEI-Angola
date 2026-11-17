"use client";

import { useState } from "react";
import { HelpCircle, X, ArrowRight, Smartphone, Share2, Copy, CheckCircle2, Globe, Shirt } from "lucide-react";
import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";

export function SheinTutorialModal() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"SHEIN" | "ALIEXPRESS" | "VINTED">("SHEIN");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { recordEvent } = useAdaptiveIntelligence();

  const handleOpen = () => {
    setOpen(true);
    recordEvent("TUTORIAL_VIEW");
  };

  const platformData = {
    SHEIN: {
      name: "SHEIN",
      color: "bg-pink-100 text-pink-700",
      accent: "text-pink-600 bg-pink-50 border-pink-200",
      badge: "Moda, Vestidos e Calçado",
      step1Title: "1. Abre a peça no aplicativo da SHEIN",
      step1Desc: "Escolhe o vestido, calçado ou conjunto no teu telemóvel.",
      step2Title: "2. Clica no ícone de Partilha",
      step2Desc: "No canto superior direito da tela do produto, toca na setinha ou nos 3 pontinhos.",
      step3Title: "3. Toca em 'Copiar Link' e cola aqui!",
      step3Desc: "Seleciona 'Copiar Link' e cola no simulador da ImportEasy para receber uma estimativa em Kwanzas, sujeita a confirmação.",
    },
    ALIEXPRESS: {
      name: "AliExpress",
      color: "bg-orange-100 text-orange-700",
      accent: "text-orange-600 bg-orange-50 border-orange-200",
      badge: "Eletrónica, Gadgets, Perucas & Bijuteria",
      step1Title: "1. Escolhe o artigo no app do AliExpress",
      step1Desc: "Navega pelos relógios, gadgets, capas, perucas ou ferramentas que desejas.",
      step2Title: "2. Toca no botão de Partilhar",
      step2Desc: "No topo direito da página do produto, toca no ícone de partilha.",
      step3Title: "3. Clica em 'Copiar' e cola aqui!",
      step3Desc: "Copia o link direto e cola aqui na ImportEasy. A equipa verifica a possibilidade de compra e envio antes do pagamento.",
    },
    VINTED: {
      name: "Vinted Europa",
      color: "bg-brand-100 text-brand-700",
      accent: "text-brand-600 bg-brand-50 border-brand-200",
      badge: "iPhones Seminovos, Sapatilhas & Roupa de Grife da Europa",
      step1Title: "1. Abre o anúncio na Vinted (França/Portugal)",
      step1Desc: "Vê o iPhone original, ténis da Nike/Jordan ou casaco que viste na Vinted.",
      step2Title: "2. Copia o Link do Anúncio",
      step2Desc: "Toca em partilhar ou copia o URL da barra de endereço do anúncio da Europa.",
      step3Title: "3. Cola aqui e recebe em Luanda!",
      step3Desc: "A nossa equipa na Europa compra, inspeciona o estado do produto/bateria e despacha para Luanda com garantia.",
    },
  };

  const cur = platformData[platform];

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
        Como tirar o link nos apps? (SHEIN, AliExpress ou Vinted)
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

            <div className="text-center mb-5">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-brand-100 text-brand-800 uppercase tracking-wider">
                Tutorial Papa Feita (3 Lojas)
              </span>
              <h3 className="text-xl font-extrabold text-ink-950 mt-2">
                Como copiar o link do produto
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Leva apenas 5 segundos para importar qualquer artigo para Angola!
              </p>
            </div>

            {/* Seletor de Loja */}
            <div className="flex gap-2 mb-5">
              {(["SHEIN", "ALIEXPRESS", "VINTED"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setStep(1);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    platform === p
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-ink-50 text-ink-700 border-ink-200 hover:bg-ink-100"
                  }`}
                >
                  {p === "SHEIN" && "SHEIN"}
                  {p === "ALIEXPRESS" && "AliExpress"}
                  {p === "VINTED" && "Vinted"}
                </button>
              ))}
            </div>

            <div className="text-center mb-4">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cur.color}`}>
                {cur.badge}
              </span>
            </div>

            {/* Abas dos 3 Passos */}
            <div className="flex gap-2 mb-5">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setStep(num as any)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    step === num
                      ? "bg-ink-950 text-white shadow-sm"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                  }`}
                >
                  <span>Passo {num}</span>
                </button>
              ))}
            </div>

            {/* Conteúdo do Passo */}
            <div className="p-5 rounded-2xl bg-ink-50 border border-ink-200 text-center space-y-3 min-h-[190px] flex flex-col justify-center items-center">
              {step === 1 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 grid place-items-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    {cur.step1Title}
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    {cur.step1Desc}
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 grid place-items-center">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    {cur.step2Title}
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    {cur.step2Desc}
                  </p>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 grid place-items-center">
                    <Copy className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-ink-900 text-sm">
                    {cur.step3Title}
                  </h4>
                  <p className="text-xs text-ink-600 max-w-xs leading-relaxed">
                    {cur.step3Desc}
                  </p>
                </>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm transition"
              >
                Entendido! Ir para o Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
