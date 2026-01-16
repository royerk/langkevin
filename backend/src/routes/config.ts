import { Router } from "express";

const router = Router();

router.get("/config", (_req, res) => {
  const workspaceId = process.env.LANGSMITH_WORKSPACE_ID;

  res.json({
    langsmith: {
      workspaceId: workspaceId ?? null,
      baseUrl: "https://smith.langchain.com",
    },
  });
});

export default router;
