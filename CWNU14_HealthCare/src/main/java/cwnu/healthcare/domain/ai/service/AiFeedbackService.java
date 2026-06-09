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
        String userPrompt = normalizePrompt(request.userPrompt());
        String summary = buildSummary(stats);
        String feedbackText = llmFeedbackClient.generateFeedback(buildPrompt(summary, stats, userPrompt), stats);

        AiFeedbackRecord record = AiFeedbackRecord.builder()
                .userId(userId)
                .targetDate(request.targetDate())
                .userPrompt(userPrompt)
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
                + "분, 물 " + stats.waterIntakeMl()
                + "ml, 수면 " + stats.sleepMinutes()
                + "분";
    }

    private String normalizePrompt(String userPrompt) {
        if (userPrompt == null || userPrompt.isBlank()) {
            return "오늘 기록을 기준으로 식단과 운동 조언을 해줘.";
        }

        return userPrompt.strip();
    }

    private String buildPrompt(String summary, DashboardStatsDto stats, String userPrompt) {
        return """
                너는 헬스케어 트래커 앱의 AI 코치다.
                사용자에게 한국어로 짧고 실용적인 피드백을 제공해라.
                의학적 진단처럼 말하지 말고, 생활 습관 조언 수준으로만 말해라.
                사용자 질문에 직접 답해라.
                2문장 이내로 답해라.

                사용자 질문: %s
                오늘 요약: %s
                목표 칼로리: %dkcal
                칼로리 밸런스: %dkcal
                물 섭취: %dml/%dml
                수면: %d분
                """.formatted(
                userPrompt,
                summary,
                stats.targetCalories(),
                stats.calorieBalance(),
                stats.waterIntakeMl(),
                stats.hydrationTargetMl(),
                stats.sleepMinutes()
        );
    }

    private AiFeedbackResponse toResponse(AiFeedbackRecord record) {
        return new AiFeedbackResponse(
                record.getId(),
                record.getTargetDate(),
                record.getUserPrompt(),
                record.getSummary(),
                record.getFeedbackText(),
                record.getCreatedAt()
        );
    }
}
