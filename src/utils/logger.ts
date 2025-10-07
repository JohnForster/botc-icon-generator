import type { ProcessingOptions } from "../types";

export const logUsage = async (file: File, extraInfo: ProcessingOptions) => {
  // Only log usage in production environment
  if (!import.meta.env.PROD) {
    return;
  }

  let FIREBASE_URL = "https://logusage-dvbaqkhwga-uc.a.run.app ";
  fetch(FIREBASE_URL, {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      filesize: file.size,
      filetype: file.type,
      ...extraInfo,
    }),
    headers: {
      "x-password": "dungeon-mister",
    },
  }).catch(console.error);
};
