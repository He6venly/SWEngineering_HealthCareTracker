package cwnu.healthcare.domain.ai.service;

import cwnu.healthcare.domain.ai.document.AiFeedbackRecord;
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

    public AiFeedbackResponse generateFeedback(String userId, AiFeedbackRequest request) {
        DashboardStatsDto stats = dashboardService.getDailyStats(userId, request.targetDate()).stats();
        String summary = buildSummary(stats);
        String feedbackText = buildFeedback(stats);

        AiFeedbackRecord record = AiFeedbackRecord.builder()
                .userId(userId)
                .targetDate(request.targetDate())
                .summary(summary)
                .feedbackText(feedbackText)
                .build();

        return toResponse(aiFeedbackRecordRepository.save(record));
    }

    public List<AiFeedbackResponse> getHistory(String userId) {
        return aiFeedbackRecordRepository.findByUserIdOrderByTargetDateDesc(userId)
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

    private String buildFeedback(DashboardStatsDto stats) {
        if (stats.intakeCalories() == 0 && stats.burnedCalories() == 0) {
            return "오늘 기록이 부족합니다. 식단이나 운동 기록을 먼저 추가하면 더 정확한 피드백을 받을 수 있습니다.";
        }
        if (stats.targetCalories() <= 0) {
            return "목표 칼로리가 설정되지 않았습니다. 건강 프로필을 먼저 설정하면 목표 대비 피드백을 제공할 수 있습니다.";
        }
        if (stats.intakeCalories() > stats.targetCalories() + 300) {
            return "목표 칼로리보다 섭취량이 높습니다. 다음 식사는 단백질과 채소 위주로 가볍게 조절하는 것이 좋습니다.";
        }
        if (stats.exerciseMinutes() == 0) {
            return "운동 기록이 없습니다. 가벼운 걷기라도 추가하면 하루 칼로리 균형을 맞추는 데 도움이 됩니다.";
        }
        if (stats.calorieBalance() < stats.targetCalories()) {
            return "오늘은 목표 대비 균형이 괜찮습니다. 현재 식단과 운동 흐름을 유지해도 좋습니다.";
        }
        return "기록 기준으로 큰 문제는 없습니다. 내일도 식단과 운동을 꾸준히 기록해 주세요.";
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
