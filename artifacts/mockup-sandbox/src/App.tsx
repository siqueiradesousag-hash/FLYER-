import { useEffect, useState, type ComponentType } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";

// Importação das suas páginas principais
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage"; 

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({ componentPath, modules }: { componentPath: string; modules: ModuleMap }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`Página não encontrada no preview.`);
        return;
      }
      try {
        const mod = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        setComponent(() => comp || null);
      } catch (e) {
        setError("Erro ao carregar componente.");
      }
    }
    loadComponent();
    return () => { cancelled = true; };
  }, [componentPath, modules]);

  if (error) return <div style={{color: 'white', padding: '20px'}}>{error}</div>;
  return Component ? <Component /> : null;
}

function App() {
  const path = window.location.pathname;

  // ROTA DE REGISTRO: Se o link termina em /register, abre o cadastro
  if (path.startsWith("/register")) {
    return <RegisterPage />;
  }

  // ROTA DE PREVIEW: Mantém as ferramentas do Replit funcionando
  if (path.startsWith("/preview/")) {
    const componentPath = path.replace("/preview/", "");
    return <PreviewRenderer componentPath={componentPath} modules={discoveredModules} />;
  }

  // ROTA PADRÃO: Qualquer outro link abre a HomePage do Money Storm
  return <HomePage />;
}

export default App;