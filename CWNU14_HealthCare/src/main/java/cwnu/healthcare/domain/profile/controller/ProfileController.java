package cwnu.healthcare.domain.profile.controller;

import cwnu.healthcare.domain.profile.dto.HealthProfileRequest;
import cwnu.healthcare.domain.profile.dto.HealthProfileResponse;
import cwnu.healthcare.domain.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<HealthProfileResponse> getProfile(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PostMapping("/update")
    public ResponseEntity<HealthProfileResponse> updateProfile(@RequestBody HealthProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
