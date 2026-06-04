package cwnu.healthcare.domain.dashboard.dto;

public record DashboardStatsDto(
        int intakeCalories,
        int burnedCalories,
        int exerciseMinutes,
        int targetCalories,
        int calorieBalance
) {
}
