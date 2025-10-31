export const INVITEE_CREDENTIALS = {
  email: process.env.INVITEE_EMAIL,
  password: process.env.INVITEE_PASSWORD,
  // dashboardUrl: 'https://ngage.ngenux.app/dashboard'
  dashboardUrl: process.env.DASHBOARD_URL,

};

export const HOST_CREDENTIALS = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  // dashboardUrl: 'https://ngage.ngenux.app/dashboard'
  dashboardUrl: process.env.DASHBOARD_URL,

};

export const POLL_TEST_DATA = {
  pollTitle: 'Favorite Fruit',
  pollQuestion: 'Which fruit do you like most?',
  option1: 'Apple',
  option2: 'Banana',
  duration: '3 minutes'
};
