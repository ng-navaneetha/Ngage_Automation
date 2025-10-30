export const INVITEE_CREDENTIALS = {
  email: process.env.INVITEE_EMAIL || 'roshan1234@gmail.com',
  password: process.env.INVITEE_PASSWORD || 'Roshan1234@',
  // dashboardUrl: 'https://ngage.ngenux.app/dashboard'
  dashboardUrl: process.env.DASHBOARD_URL || "https://d2wdcwfqlxuzb6.cloudfront.net/",

};

export const HOST_CREDENTIALS = {
  email: process.env.EMAIL || 'roshanreddy@gmail.com',
  password: process.env.PASSWORD || 'Roshan12345@',
  // dashboardUrl: 'https://ngage.ngenux.app/dashboard'
  dashboardUrl: process.env.DASHBOARD_URL || "https://d2wdcwfqlxuzb6.cloudfront.net/",

};

export const POLL_TEST_DATA = {
  pollTitle: 'Favorite Fruit',
  pollQuestion: 'Which fruit do you like most?',
  option1: 'Apple',
  option2: 'Banana',
  duration: '3 minutes'
};
