package cwnu.healthcare.domain.profile.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfileRequest {
    @NotNull
    @Positive
    private double height;

    @NotNull
    @Positive
    private double weight;

    @NotNull
    @Positive
    private int targetCalories;

    @NotNull
    @Positive
    private double targetWeight;
}
