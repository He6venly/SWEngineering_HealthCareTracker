package cwnu.healthcare.domain.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklyDashboardResponse(
        LocalDate startDate,
        LocalDate endDate,
        DashboardStatsDto stats,
        List<DailyDashboardResponse> dailyStats
) {
}
