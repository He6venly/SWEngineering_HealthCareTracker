package cwnu.healthcare.domain.wellness.document;

import cwnu.healthcare.global.common.BaseDocument;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "sleep_records")
@CompoundIndex(name = "user_date_unique", def = "{'userId': 1, 'recordDate': 1}", unique = true)
public class SleepRecord extends BaseDocument {
    @Id
    private String id;

    @Indexed
    private String userId;

    private LocalDate recordDate;

    private LocalTime sleepStartTime;

    private LocalTime wakeTime;

    private int durationMinutes;

    @Builder
    public SleepRecord(String userId, LocalDate recordDate, LocalTime sleepStartTime, LocalTime wakeTime, int durationMinutes) {
        this.userId = userId;
        this.recordDate = recordDate;
        this.sleepStartTime = sleepStartTime;
        this.wakeTime = wakeTime;
        this.durationMinutes = durationMinutes;
    }

    public void update(LocalTime sleepStartTime, LocalTime wakeTime, int durationMinutes) {
        this.sleepStartTime = sleepStartTime;
        this.wakeTime = wakeTime;
        this.durationMinutes = durationMinutes;
    }
}
