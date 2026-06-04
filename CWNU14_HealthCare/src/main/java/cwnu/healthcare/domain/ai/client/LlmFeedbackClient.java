package cwnu.healthcare.domain.ai.client;

import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;

public interface LlmFeedbackClient {

    String generateFeedback(String prompt, DashboardStatsDto stats);
}
