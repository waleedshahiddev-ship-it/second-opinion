const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { event_title, start_datetime, end_datetime, unique_request_id } = req.body;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.events.insert({
      calendarId: process.env.MASTER_CALENDAR_ID,
      conferenceDataVersion: 1,
      requestBody: {
        summary: event_title,
        description: '1-on-1 Consultation via Second Opinion',
        start: { dateTime: start_datetime },
        end: { dateTime: end_datetime },
        conferenceData: {
          createRequest: {
            requestId: unique_request_id,
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
}
