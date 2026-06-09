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
public class HealthProfileUpdateRequest {
    @NotNull
    @Positive
    private Double height;

    @NotNull
    @Positive
    private Double weight;

    @NotNull
    @Positive
    private Integer targetCalories;

    @NotNull
    @Positive
    private Double targetWeight;
}
