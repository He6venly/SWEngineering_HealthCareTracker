package cwnu.healthcare.domain.activity.controller;

import cwnu.healthcare.domain.activity.dto.ActivityResponse;
import cwnu.healthcare.domain.activity.dto.DietRecordRequest;
import cwnu.healthcare.domain.activity.dto.ExerciseRecordRequest;
import cwnu.healthcare.domain.activity.service.ActivityService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/diets")
    public ApiResponse<ActivityResponse> addDiet(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody DietRecordRequest request
    ) {
        return ApiResponse.success(activityService.addDiet(userId, request));
    }

    @PostMapping("/exercises")
    public ApiResponse<ActivityResponse> addExercise(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ExerciseRecordRequest request
    ) {
        return ApiResponse.success(activityService.addExercise(userId, request));
    }

    @GetMapping
    public ApiResponse<List<ActivityResponse>> getActivities(
            @AuthenticationPrincipal String userId,
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ApiResponse.success(activityService.getActivities(userId, date));
    }
}
