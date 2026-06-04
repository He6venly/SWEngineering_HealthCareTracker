package cwnu.healthcare.domain.ai.service;

import cwnu.healthcare.domain.ai.document.AiFeedbackRecord;
import cwnu.healthcare.domain.ai.client.LlmFeedbackClient;
import cwnu.healthcare.domain.ai.dto.AiFeedbackRequest;
import cwnu.healthcare.domain.ai.dto.AiFeedbackResponse;
import cwnu.healthcare.domain.ai.repository.AiFeedbackRecordRepository;
import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;
import cwnu.healthcare.domain.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiFeedbackService {

    private final AiFeedbackRecordRepository aiFeedbackRecordRepository;
    private final DashboardService dashboardService;
    private final LlmFeedbackClient llmFeedbackClient;

    public AiFeedbackResponse generateFeedback(String userId, AiFeedbackRequest request) {
        DashboardStatsDto stats = dashboardService.getDailyStats(userId, request.targetDate()).stats();
        String summary = buildSummary(stats);
        String feedbackText = llmFeedbackClient.generateFeedback(buildPrompt(summary, stats), stats);

        AiFeedbackRecord record = AiFeedbackRecord.builder()
                .userId(userId)
                .targetDate(request.targetDate())
                .summary(summary)
                .feedbackText(feedbackText)
                .build();

        return toResponse(aiFeedbackRecordRepository.save(record));
    }

    public List<AiFeedbackResponse> getHistory(String userId) {
        return aiFeedbackRecordRepository.findTop10ByUserIdOrderByTargetDateDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String buildSummary(DashboardStatsDto stats) {
        return "섭취 " + stats.intakeCalories()
                + "kcal, 소모 " + stats.burnedCalories()
                + "kcal, 운동 " + stats.exerciseMinutes()
                + "분";
    }

    private String buildPrompt(String summary, DashboardStatsDto stats) {
        return """
                너는 헬스케어 트래커 앱의 AI 코치다.
                사용자에게 한국어로 짧고 실용적인 피드백을 제공해라.
                의학적 진단처럼 말하지 말고, 생활 습관 조언 수준으로만 말해라.
                2문장 이내로 답해라.

                오늘 요약: %s
                목표 칼로리: %dkcal
                칼로리 밸런스: %dkcal
                """.formatted(summary, stats.targetCalories(), stats.calorieBalance());
    }

    private AiFeedbackResponse toResponse(AiFeedbackRecord record) {
        return new AiFeedbackResponse(
                record.getId(),
                record.getTargetDate(),
                record.getSummary(),
                record.getFeedbackText(),
                record.getCreatedAt()
        );
    }
}
