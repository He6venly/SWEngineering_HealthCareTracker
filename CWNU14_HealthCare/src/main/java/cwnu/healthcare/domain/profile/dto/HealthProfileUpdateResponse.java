package cwnu.healthcare.domain.profile.dto;

import cwnu.healthcare.domain.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfileUpdateResponse {
    private UserResponse user;

    private HealthProfileResponse profile;
}
