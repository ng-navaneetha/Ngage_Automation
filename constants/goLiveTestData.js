export const goLiveTestData = {
  // dashboardUrl: "https://ngage.ngenux.app/dashboard",
  dashboardUrl: process.env.DASHBOARD_URL || "https://d2wdcwfqlxuzb6.cloudfront.net/",
  streamTitle: "Test Meeting",
  streamDescription: "Automated test meeting.",
  inviteEmail: process.env.INVITE_EMAIL || "testuser@example.com",
  errorText: "Participant not found",
  welcomeBackHeading: /Welcome Back/
};
