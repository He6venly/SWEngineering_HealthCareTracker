package cwnu.healthcare.domain.dashboard.controller;

import cwnu.healthcare.domain.dashboard.dto.DailyDashboardResponse;
import cwnu.healthcare.domain.dashboard.dto.WeeklyDashboardResponse;
import cwnu.healthcare.domain.dashboard.service.DashboardService;
import cwnu.healthcare.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/daily")
    public ApiResponse<DailyDashboardResponse> getDailyStats(
            @AuthenticationPrincipal String userId,
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ApiResponse.success(dashboardService.getDailyStats(userId, date));
    }

    @GetMapping("/weekly")
    public ApiResponse<WeeklyDashboardResponse> getWeeklySummary(
            @AuthenticationPrincipal String userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate
    ) {
        return ApiResponse.success(dashboardService.getWeeklySummary(userId, startDate));
    }
}
