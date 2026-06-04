package cwnu.healthcare.domain.ai.document;

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
@Document(collection = "ai_feedback_records")
public class AiFeedbackRecord extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private LocalDate targetDate;

    private String summary;

    private String feedbackText;

    @Builder
    public AiFeedbackRecord(String userId, LocalDate targetDate, String summary, String feedbackText) {
        this.userId = userId;
        this.targetDate = targetDate;
        this.summary = summary;
        this.feedbackText = feedbackText;
    }
}
