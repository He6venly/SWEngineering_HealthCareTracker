package cwnu.healthcare.domain.profile.document;

import cwnu.healthcare.global.common.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "health_profiles")
public class HealthProfile extends BaseDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private double height;

    private double weight;

    private int targetCalories;

    private double targetWeight;
}
