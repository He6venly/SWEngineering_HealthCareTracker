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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "hydration_records")
@CompoundIndex(name = "user_date_unique", def = "{'userId': 1, 'recordDate': 1}", unique = true)
public class HydrationRecord extends BaseDocument {
    @Id
    private String id;

    @Indexed
    private String userId;

    private LocalDate recordDate;

    private int targetMl;

    private int intakeMl;

    @Builder
    public HydrationRecord(String userId, LocalDate recordDate, int targetMl, int intakeMl) {
        this.userId = userId;
        this.recordDate = recordDate;
        this.targetMl = targetMl;
        this.intakeMl = intakeMl;
    }

    public void updateTarget(int targetMl) {
        this.targetMl = targetMl;
    }

    public void addIntake(int amountMl) {
        this.intakeMl += amountMl;
    }
}
