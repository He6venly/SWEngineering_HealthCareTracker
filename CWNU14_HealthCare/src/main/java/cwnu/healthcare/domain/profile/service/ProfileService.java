package cwnu.healthcare.domain.profile.service;

import cwnu.healthcare.domain.profile.document.HealthProfile;
import cwnu.healthcare.domain.profile.dto.HealthProfileResponse;
import cwnu.healthcare.domain.profile.dto.HealthProfileUpdateRequest;
import cwnu.healthcare.domain.profile.dto.HealthProfileUpdateResponse;
import cwnu.healthcare.domain.profile.repository.HealthProfileRepository;
import cwnu.healthcare.domain.user.document.User;
import cwnu.healthcare.domain.user.dto.UserResponse;
import cwnu.healthcare.domain.user.repository.UserRepository;
import cwnu.healthcare.global.exception.BusinessException;
import cwnu.healthcare.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final HealthProfileRepository healthProfileRepository;
    private final UserRepository userRepository;

    public HealthProfileResponse getProfile(String userId) {
        HealthProfile profile = healthProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROFILE_NOT_FOUND));

        return toResponse(profile);
    }

    @Transactional
    public HealthProfileUpdateResponse updateProfile(String userId, HealthProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        HealthProfile profile = healthProfileRepository.findByUserId(userId)
                .map(existingProfile -> {
                    existingProfile.update(
                            request.getHeight(),
                            request.getWeight(),
                            request.getTargetCalories(),
                            request.getTargetWeight()
                    );
                    return existingProfile;
                })
                .orElseGet(() -> HealthProfile.builder()
                        .userId(userId)
                        .height(request.getHeight())
                        .weight(request.getWeight())
                        .targetCalories(request.getTargetCalories())
                        .targetWeight(request.getTargetWeight())
                        .build());

        HealthProfile savedProfile = healthProfileRepository.save(profile);
        return HealthProfileUpdateResponse.builder()
                .user(UserResponse.from(user))
                .profile(toResponse(savedProfile))
                .build();
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
