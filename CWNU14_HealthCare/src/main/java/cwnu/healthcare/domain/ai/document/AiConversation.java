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
@Document(collection = "ai_conversations")
public class AiConversation extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private LocalDate targetDate;

    private String lastMessagePreview;

    @Builder
    public AiConversation(String userId, String title, LocalDate targetDate, String lastMessagePreview) {
        this.userId = userId;
        this.title = title;
        this.targetDate = targetDate;
        this.lastMessagePreview = lastMessagePreview;
    }

    public void updateAfterMessage(LocalDate targetDate, String title, String lastMessagePreview) {
        this.targetDate = targetDate;
        this.title = title;
        this.lastMessagePreview = lastMessagePreview;
    }
}
