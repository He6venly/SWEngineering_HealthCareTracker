package cwnu.healthcare.domain.activity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import cwnu.healthcare.domain.activity.type.ExerciseSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseRecordRequest {

    @NotBlank(message = "운동 이름은 필수입니다.")
    private String exerciseName;

    @Positive(message = "운동 시간은 0보다 커야 합니다.")
    private int durationMinutes;

    @Positive(message = "소모 칼로리는 0보다 커야 합니다.")
    private int caloriesBurned;

    @NotNull(message = "운동 기록 출처는 필수입니다.")
    private ExerciseSource source;

    @NotNull(message = "기록 날짜는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;
}
