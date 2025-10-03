export const logUsage = async (file: File) => {
  let FIREBASE_URL = "https://logusage-dvbaqkhwga-uc.a.run.app ";
  fetch(FIREBASE_URL, {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      filesize: file.size,
      filetype: file.type,
    }),
    headers: {
      "x-password": "dungeon-mister",
    },
  }).catch(console.error);
};
