package cwnu.healthcare.domain.profile.controller;

import cwnu.healthcare.domain.profile.dto.HealthProfileRequest;
import cwnu.healthcare.domain.profile.dto.HealthProfileResponse;
import cwnu.healthcare.domain.profile.service.ProfileService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthProfileResponse>> getProfile(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(userId)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<HealthProfileResponse>> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody HealthProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(profileService.updateProfile(userId, request)));
    }
}
