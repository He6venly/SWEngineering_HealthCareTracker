package cwnu.healthcare.domain.ai.client;

import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;
import org.springframework.stereotype.Component;

@Component
public class RuleBasedFeedbackClient implements LlmFeedbackClient {

    @Override
    public String generateFeedback(String prompt, DashboardStatsDto stats) {
        String normalizedPrompt = prompt == null ? "" : prompt;
        boolean hasNoRecord = stats.intakeCalories() == 0
                && stats.burnedCalories() == 0
                && stats.exerciseMinutes() == 0
                && stats.waterIntakeMl() == 0
                && stats.sleepMinutes() == 0;

        if (hasNoRecord) {
            if (normalizedPrompt.contains("식단") || normalizedPrompt.contains("추천") || normalizedPrompt.contains("초보")) {
                return "아직 기록이 없어서 맞춤 분석은 어렵지만, 처음이라면 한 끼를 밥/단백질/채소로 나눠 대략적인 칼로리부터 적어보세요. 예를 들어 점심에 닭가슴살, 밥, 샐러드를 먹었다면 음식명과 예상 칼로리만 기록해도 다음 조언이 훨씬 정확해집니다.";
            }
            if (normalizedPrompt.contains("운동")) {
                return "오늘 운동 기록이 없으니 먼저 15~20분 걷기처럼 부담 없는 활동부터 시작해보세요. 운동명, 시간, 예상 소모 칼로리를 기록하면 다음 질문부터 목표 대비 부족한 부분을 이어서 알려드릴 수 있습니다.";
            }
            return "오늘은 아직 식단이나 운동 기록이 없습니다. 처음 시작이라면 한 끼 음식명과 대략적인 칼로리, 걷기 같은 가벼운 운동 시간부터 기록해보세요.";
        }

        if (normalizedPrompt.contains("내일") || normalizedPrompt.contains("목표")) {
            return "내일은 식단 기록 3회와 20분 이상 걷기를 목표로 해보세요. 오늘 기록을 기준으로 무리한 목표보다 꾸준히 달성 가능한 목표가 좋습니다.";
        }
        if (normalizedPrompt.contains("식단") || normalizedPrompt.contains("식사") || normalizedPrompt.contains("추천")) {
            if (stats.targetCalories() > 0 && stats.intakeCalories() > stats.targetCalories()) {
                return "현재 섭취량이 목표를 넘었으니 다음 식사는 단백질과 채소 위주로 가볍게 구성해보세요. 국물, 간식, 음료 칼로리를 줄이면 초과분을 관리하기 쉽습니다.";
            }
            return "다음 식사는 단백질 1가지, 채소 1~2가지, 탄수화물은 평소보다 조금 덜어 구성해보세요. 오늘 기록을 이어서 남기면 목표 칼로리에 맞춰 더 구체적으로 조절해드릴 수 있습니다.";
        }
        if (normalizedPrompt.contains("운동량") || normalizedPrompt.contains("운동")) {
            if (stats.exerciseMinutes() >= 30) {
                return "오늘 운동량은 기본 목표를 충족한 편입니다. 무리하게 늘리기보다 수분 섭취와 회복을 함께 챙겨주세요.";
            }
            return "오늘 운동량은 조금 부족한 편입니다. 15분 정도 가벼운 걷기를 추가하면 칼로리 균형에 도움이 됩니다.";
        }
        if (normalizedPrompt.contains("물") || normalizedPrompt.contains("수분")) {
            int remainingMl = Math.max(0, stats.hydrationTargetMl() - stats.waterIntakeMl());
            if (remainingMl == 0) {
                return "오늘 물 섭취 목표는 채운 상태입니다. 한 번에 많이 마시기보다 지금처럼 나눠 마시는 흐름을 유지해 주세요.";
            }
            return "오늘 물 섭취 목표까지 " + remainingMl + "ml 남았습니다. 250ml 정도씩 나눠 마시면 부담 없이 목표에 가까워질 수 있습니다.";
        }
        if (normalizedPrompt.contains("수면") || normalizedPrompt.contains("잠") || normalizedPrompt.contains("취침")) {
            if (stats.sleepMinutes() == 0) {
                return "수면 기록이 아직 없습니다. 취침 시간과 기상 시간을 먼저 저장하면 수면 패턴을 기준으로 더 구체적인 조언을 받을 수 있습니다.";
            }
            if (stats.sleepMinutes() < 360) {
                return "오늘 수면 시간이 6시간 미만이라 회복 시간이 부족한 편입니다. 오늘은 카페인과 늦은 운동을 줄이고 평소보다 조금 일찍 누워보세요.";
            }
            return "수면 시간이 기본 회복 범위에 들어왔습니다. 같은 시간대에 자고 일어나는 리듬을 유지하면 컨디션 관리에 도움이 됩니다.";
        }
        if (normalizedPrompt.contains("칼로리") || normalizedPrompt.contains("균형")) {
            return "현재 칼로리 균형은 섭취 "
                    + stats.intakeCalories()
                    + "kcal, 소모 "
                    + stats.burnedCalories()
                    + "kcal 기준입니다. 목표 칼로리와 차이를 보며 다음 식사량을 조절하세요.";
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
}
