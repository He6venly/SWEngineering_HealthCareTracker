package cwnu.healthcare.domain.wellness.controller;

import cwnu.healthcare.domain.wellness.dto.HydrationAddRequest;
import cwnu.healthcare.domain.wellness.dto.HydrationResponse;
import cwnu.healthcare.domain.wellness.dto.HydrationTargetRequest;
import cwnu.healthcare.domain.wellness.dto.SleepRecordRequest;
import cwnu.healthcare.domain.wellness.dto.SleepResponse;
import cwnu.healthcare.domain.wellness.service.WellnessService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/wellness")
@RequiredArgsConstructor
public class WellnessController {
    private final WellnessService wellnessService;

    @GetMapping("/hydration")
    public ApiResponse<HydrationResponse> getHydration(
            @AuthenticationPrincipal String userId,
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ApiResponse.success(wellnessService.getHydration(userId, date));
    }

    @PatchMapping("/hydration/target")
    public ApiResponse<HydrationResponse> updateHydrationTarget(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody HydrationTargetRequest request
    ) {
        return ApiResponse.success(wellnessService.updateHydrationTarget(userId, request));
    }

    @PostMapping("/hydration/intake")
    public ApiResponse<HydrationResponse> addHydration(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody HydrationAddRequest request
    ) {
        return ApiResponse.success(wellnessService.addHydration(userId, request));
    }

    @GetMapping("/sleep")
    public ApiResponse<SleepResponse> getSleep(
            @AuthenticationPrincipal String userId,
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ApiResponse.success(wellnessService.getSleep(userId, date));
    }

    @PutMapping("/sleep")
    public ApiResponse<SleepResponse> saveSleep(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SleepRecordRequest request
    ) {
        return ApiResponse.success(wellnessService.saveSleep(userId, request));
    }
}
