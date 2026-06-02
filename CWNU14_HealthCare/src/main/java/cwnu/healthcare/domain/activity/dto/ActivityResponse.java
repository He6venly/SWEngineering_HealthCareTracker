package cwnu.healthcare.domain.activity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import cwnu.healthcare.domain.activity.type.ExerciseSource;
import cwnu.healthcare.domain.activity.type.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityResponse {

    private String recordId;

    private String type;

    private String name;

    private int calories;

    private Integer durationMinutes;

    private MealType mealType;

    private ExerciseSource source;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;
}
