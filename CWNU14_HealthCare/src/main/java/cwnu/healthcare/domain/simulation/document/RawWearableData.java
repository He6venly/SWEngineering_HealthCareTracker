package cwnu.healthcare.domain.simulation.document;

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
@Document(collection = "raw_wearable_data")
public class RawWearableData extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private int stepCount;

    private int averageHeartRate;

    private int durationMinutes;

    private int caloriesBurned;

    @Indexed
    private LocalDate recordDate;

    @Builder
    public RawWearableData(String userId, int stepCount, int averageHeartRate,
                           int durationMinutes, int caloriesBurned, LocalDate recordDate) {
        this.userId = userId;
        this.stepCount = stepCount;
        this.averageHeartRate = averageHeartRate;
        this.durationMinutes = durationMinutes;
        this.caloriesBurned = caloriesBurned;
        this.recordDate = recordDate;
    }
}
