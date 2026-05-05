import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { config } = useAppConfig();
  const [referralCode, setReferralCode] = useState("Nenhum");

  // Captura o código de quem convidou de forma segura para Web e APK
  useEffect(() => {
    try {
      // 1. Tenta pegar pela URL padrão do navegador
      const params = new URLSearchParams(window.location.search);
      let ref = params.get("ref");

      // 2. Se não achar (comum em roteamento de APKs), tenta ler da URL cheia do wouter/window
      if (!ref) {
        const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
        ref = hashParams.get("ref");
      }

      if (ref) {
        setReferralCode(ref);
        // Salva localmente para garantir que o cadastro não perca a referência
        localStorage.setItem("pending_referrer", ref);
      } else {
        // Fallback: verifica se já tinha um código salvo antes de abrir essa tela
        const savedRef = localStorage.getItem("pending_referrer");
        if (savedRef) setReferralCode(savedRef);
      }
    } catch (e) {
      console.warn("Erro ao ler código de indicação:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1e1e1e] border-[#2a2a2a] shadow-2xl">
        <CardContent className="pt-8 flex flex-col items-center">
          <img 
            src={config?.logoUrl} 
            alt="Logo" 
            className="w-24 h-24 rounded-2xl mb-6 object-contain shadow-lg border border-[#333]" 
          />

          <h1 className="text-[#FFD700] text-2xl font-bold mb-2">{config?.appName}</h1>
          <p className="text-gray-400 text-center mb-8 px-4">
            Você foi convidado para a nossa comunidade! Finalize seu cadastro para começar a ganhar.
          </p>

          <div className="w-full space-y-6">
            <div className="bg-[#2a2a2a] p-4 rounded-xl text-center border border-[#333]">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Código do Convidante</span>
              <p className="text-[#FFD700] font-mono font-bold text-xl mt-1">{referralCode}</p>
            </div>

            <Button 
              onClick={() => setLocation("/")}
              className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black h-14 rounded-2xl text-lg transition-all active:scale-95"
            >
              CRIAR MINHA CONTA
            </Button>

            <p className="text-[10px] text-gray-600 text-center uppercase">
              Ao continuar, você concorda com nossos termos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}