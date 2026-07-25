const { google } = require('googleapis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { event_title, start_datetime, end_datetime, unique_request_id } = req.body;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: process.env.MASTER_CALENDAR_ID, // usually 'primary' for personal accounts
      conferenceDataVersion: 1,
      requestBody: {
        summary: event_title || 'Consultation Meeting',
        description: '1-on-1 Consultation via Second Opinion',
        start: { dateTime: start_datetime },
        end: { dateTime: end_datetime },
        conferenceData: {
          createRequest: {
            requestId: unique_request_id || `req_${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    return res.status(200).json({
      meet_url: response.data.hangoutLink,
      event_id: response.data.id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
