package cwnu.healthcare.domain.profile.document;

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
public class HealthProfile {

    @Id
    private String id;

    @Indexed
    private String userId;

    private double height;

    private double weight;

    private int targetCalories;

    private double targetWeight;
}