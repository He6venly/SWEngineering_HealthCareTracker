package cwnu.healthcare.domain.activity.document;

import cwnu.healthcare.domain.activity.type.MealType;
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
@Document(collection = "diet_records")
public class DietRecord extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private MealType mealType;

    private String foodName;

    private int calories;

    @Indexed
    private LocalDate recordDate;

    @Builder
    public DietRecord(String userId, MealType mealType, String foodName, int calories, LocalDate recordDate) {
        this.userId = userId;
        this.mealType = mealType;
        this.foodName = foodName;
        this.calories = calories;
        this.recordDate = recordDate;
    }
}
