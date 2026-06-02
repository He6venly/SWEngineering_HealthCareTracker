package cwnu.healthcare.domain.simulation.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WearableSimulationRequest {

    @PositiveOrZero(message = "걸음 수는 0 이상이어야 합니다.")
    private int stepCount;

    @Positive(message = "평균 심박수는 0보다 커야 합니다.")
    private int averageHeartRate;

    @Positive(message = "운동 시간은 0보다 커야 합니다.")
    private int durationMinutes;

    @NotNull(message = "기록 날짜는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;
}
