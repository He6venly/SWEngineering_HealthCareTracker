package cwnu.healthcare.domain.profile.service;

import cwnu.healthcare.domain.profile.document.HealthProfile;
import cwnu.healthcare.domain.profile.dto.HealthProfileRequest;
import cwnu.healthcare.domain.profile.dto.HealthProfileResponse;
import cwnu.healthcare.domain.profile.repository.HealthProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final HealthProfileRepository healthProfileRepository;

    public HealthProfileResponse getProfile(String userId) {
        HealthProfile profile = healthProfileRepository.findByUserId(userId)
                .orElseThrow(NoSuchElementException::new);

        return toResponse(profile);
    }

    public HealthProfileResponse updateProfile(String userId, HealthProfileRequest request) {
        HealthProfile profile = healthProfileRepository.findByUserId(userId)
                .map(existingProfile -> HealthProfile.builder()
                        .id(existingProfile.getId())
                        .userId(existingProfile.getUserId())
                        .height(request.getHeight())
                        .weight(request.getWeight())
                        .targetCalories(request.getTargetCalories())
                        .targetWeight(request.getTargetWeight())
                        .build())
                .orElseGet(() -> HealthProfile.builder()
                        .userId(userId)
                        .height(request.getHeight())
                        .weight(request.getWeight())
                        .targetCalories(request.getTargetCalories())
                        .targetWeight(request.getTargetWeight())
                        .build());

        HealthProfile savedProfile = healthProfileRepository.save(profile);
        return toResponse(savedProfile);
    }

    private HealthProfileResponse toResponse(HealthProfile profile) {
        return HealthProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .targetCalories(profile.getTargetCalories())
                .targetWeight(profile.getTargetWeight())
                .build();
    }
}
