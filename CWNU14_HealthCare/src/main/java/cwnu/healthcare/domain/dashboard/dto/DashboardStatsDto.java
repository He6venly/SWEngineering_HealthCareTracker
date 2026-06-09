package cwnu.healthcare.domain.dashboard.dto;

public record DashboardStatsDto(
        int intakeCalories,
        int burnedCalories,
        int exerciseMinutes,
        int targetCalories,
        int calorieBalance,
        int hydrationTargetMl,
        int waterIntakeMl,
        String sleepStartTime,
        String wakeTime,
        int sleepMinutes
) {
}
