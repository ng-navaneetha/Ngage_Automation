export const startClassTestData = {
  dashboardUrl: "https://ngage.ngenux.app/dashboard",
  classTitle: "Test Real-Time Class",
  classDescription: "Automated test class for real-time interaction.",
  instructorEmail: "instructor@example.com",
  studentEmail: "student@example.com",
  participantEmail: "participant@example.com",
  chatMessage: "Hello, this is a test message in real-time chat",
  latencyThreshold: 300, // 300 milliseconds
  errorText: "Class initialization failed",
  successText: "Class started successfully",
  welcomeMessage: /Welcome to the class/,
  chatDeliveredText: "Message delivered",
  pollQuestion: "What is your understanding of this topic?",
  pollOptions: ["Excellent", "Good", "Fair", "Needs Improvement"],
  annotationText: "This is a test annotation",
  networkConditions: {
    slow3g: {
      downloadThroughput: 500 * 1024, // 500 Kbps
      uploadThroughput: 500 * 1024,   // 500 Kbps
      latency: 400 // 400ms latency
    },
    fast3g: {
      downloadThroughput: 1.6 * 1024 * 1024, // 1.6 Mbps
      uploadThroughput: 750 * 1024,           // 750 Kbps
      latency: 150 // 150ms latency
    }
  }
};
