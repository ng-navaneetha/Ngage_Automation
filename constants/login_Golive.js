export const TEST_DATA = {
  // dashboardUrl: 'https://ngage.ngenux.app/dashboard',
  dashboardUrl: process.env.DASHBOARD_URL || "https://d2wdcwfqlxuzb6.cloudfront.net/",
  email: process.env.EMAIL || 'roshanreddy@gmail.com',
  password: process.env.PASSWORD || 'Roshan12345@',
  inviteEmail: process.env.INVITE_EMAIL || 'testuser@example.com',
  streamTitle: 'Test Meeting',
  streamDescription: 'Automated test meeting.'
};
