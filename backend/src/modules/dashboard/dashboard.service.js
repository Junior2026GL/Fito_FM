import * as repo from "./dashboard.repository.js";

export const getSummary = async () => {
  const [usuarios, electoral] = await Promise.all([
    repo.getUsersSummary(),
    repo.getElectoralSummary()
  ]);

  return { usuarios, electoral };
};
