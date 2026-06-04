package cwnu.healthcare.domain.dashboard.dto;

import java.time.LocalDate;

public record DailyDashboardResponse(
        LocalDate date,
        DashboardStatsDto stats
) {
}
