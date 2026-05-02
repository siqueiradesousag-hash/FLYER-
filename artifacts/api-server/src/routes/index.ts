import { Router, type IRouter } from "express";
import healthRouter from "./health";
import path from "path";

const router: IRouter = Router();

// Mantém a rota de saúde que já existia
router.use(healthRouter);

/**
 * LÓGICA PARA CONVITES (MONEY STORM)
 * Quando alguém clica no link /register, o servidor agora aceita o pedido
 * e entrega o aplicativo para o usuário se cadastrar.
 */
router.get("/register", (_req, res) => {
  // Tenta entregar o arquivo principal do app
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"), (err) => {
    if (err) {
      // Se estiver em desenvolvimento e o arquivo não existir, apenas envia status ok
      res.status(200).send("Carregando sistema de convites...");
    }
  });
});

export default router;