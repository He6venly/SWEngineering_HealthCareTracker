package cwnu.healthcare.domain.profile.controller;

import cwnu.healthcare.domain.profile.dto.HealthProfileRequest;
import cwnu.healthcare.domain.profile.dto.HealthProfileResponse;
import cwnu.healthcare.domain.profile.service.ProfileService;
import cwnu.healthcare.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    public ApiResponse<HealthProfileResponse> getProfile(@AuthenticationPrincipal String userId) {
        return ApiResponse.success(profileService.getProfile(userId));
    }

    @PostMapping("/update")
    public ApiResponse<HealthProfileResponse> updateProfile(
            @AuthenticationPrincipal String userId,
            @RequestBody HealthProfileRequest request
    ) {
        return ApiResponse.success(profileService.updateProfile(userId, request));
    }
}
