import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';

const sheetApiKey = defineString('SHEET_API_KEY');

export const fetchData = onRequest({ cors: true }, async (_req, res) => {
  const SPREADSHEET_ID = '1NMnCR2VFc_QWvdpd8R63JgsaWR6ERixwMBueE56gG6c';
  const API_KEY = sheetApiKey.value();
  const RANGE = 'Match History!A2:F9999';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await response.json();

  res.send({ data });
});
