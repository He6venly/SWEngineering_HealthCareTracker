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

    // 1. 조회 기능: 명시적으로 ("userId")와 데이터 타입(String)을 지정하여 500 에러 방지 (두 번째 코드 방식 적용)
    @GetMapping("/{userId}")
    public ResponseEntity<HealthProfileResponse> getProfile(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    // 2. 수정 기능: 반드시 getProfile이 아닌 "updateProfile(request)"을 호출하여 DB 수정을 정상 반영!
    @PostMapping("/update")
    public ResponseEntity<HealthProfileResponse> updateProfile(@RequestBody HealthProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
