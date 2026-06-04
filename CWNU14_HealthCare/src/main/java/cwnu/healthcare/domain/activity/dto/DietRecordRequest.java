package cwnu.healthcare.domain.activity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import cwnu.healthcare.domain.activity.type.MealType;
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
public class DietRecordRequest {

    @NotNull(message = "식사 유형은 필수입니다.")
    private MealType mealType;

    @NotBlank(message = "음식 이름은 필수입니다.")
    private String foodName;

    @Positive(message = "칼로리는 0보다 커야 합니다.")
    private int calories;

    @NotNull(message = "기록 날짜는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;
}
