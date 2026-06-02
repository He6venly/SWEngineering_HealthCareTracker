package cwnu.healthcare.domain.activity.document;

import cwnu.healthcare.domain.activity.type.ExerciseSource;
import cwnu.healthcare.global.common.BaseDocument;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "exercise_records")
public class ExerciseRecord extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String exerciseName;

    private int durationMinutes;

    private int caloriesBurned;

    private ExerciseSource source;

    @Indexed
    private LocalDate recordDate;

    @Builder
    public ExerciseRecord(String userId, String exerciseName, int durationMinutes,
                          int caloriesBurned, ExerciseSource source, LocalDate recordDate) {
        this.userId = userId;
        this.exerciseName = exerciseName;
        this.durationMinutes = durationMinutes;
        this.caloriesBurned = caloriesBurned;
        this.source = source;
        this.recordDate = recordDate;
    }
}
