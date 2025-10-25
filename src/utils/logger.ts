import type { ProcessingOptions } from "../types";

const FIREBASE_URL = "https://logusage-dvbaqkhwga-uc.a.run.app";

export const logUsage = async (file: File, extraInfo: ProcessingOptions) => {
  // Only log usage in production environment
  if (!import.meta.env.PROD) {
    return;
  }

  fetch(FIREBASE_URL, {
    method: "POST",
    body: JSON.stringify({
      app: "icon-generator",
      filename: file.name,
      filesize: file.size,
      filetype: file.type,
      ...extraInfo,
    }),
    headers: {
      "x-password": "dungeon-mister",
      "Content-Type": "application/json",
    },
  }).catch(console.error);
};
