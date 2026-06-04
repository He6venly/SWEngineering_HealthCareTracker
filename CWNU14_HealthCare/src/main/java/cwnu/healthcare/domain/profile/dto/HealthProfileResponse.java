package cwnu.healthcare.domain.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfileResponse {
    private String id;

    private String userId;

    private double height;

    private double weight;

    private int targetCalories;

    private double targetWeight;
}
