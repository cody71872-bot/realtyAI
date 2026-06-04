const { google } = require('googleapis');

async function getSheetsClient() {
  let auth;
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    // If no credentials, we can't initialize
    return null;
  }
  
  try {
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (error) {
    console.error('Failed to get Google Sheets client:', error);
    return null;
  }
}

async function appendRow(spreadsheetId, range, values) {
  if (!spreadsheetId) {
    console.error('Spreadsheet ID is missing');
    return;
  }
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      console.error('Google Sheets client not initialized. Check credentials.');
      return;
    }
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    });
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
  }
}

async function appendLead(leadData) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_LEADS || process.env.GOOGLE_SHEET_ID;
  const values = [
    leadData.name,
    leadData.email,
    leadData.phone,
    leadData.type,
    leadData.budget,
    leadData.timeline,
    new Date().toISOString()
  ];
  return appendRow(spreadsheetId, 'Leads!A:G', values);
}

async function appendOpenHouse(visitorData) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_OPENHOUSE || process.env.GOOGLE_SHEET_ID;
  const values = [
    visitorData.name,
    visitorData.email,
    visitorData.phone,
    visitorData.rentOrOwn,
    visitorData.timeline,
    new Date().toISOString()
  ];
  return appendRow(spreadsheetId, 'OpenHouse!A:F', values);
}

async function appendContent(contentData) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID_CONTENT || process.env.GOOGLE_SHEET_ID;
  const values = [
    contentData.address,
    contentData.caption,
    contentData.storyScript,
    contentData.newsletterIntro,
    new Date().toISOString()
  ];
  return appendRow(spreadsheetId, 'Content!A:E', values);
}

module.exports = {
  appendLead,
  appendOpenHouse,
  appendContent
};
