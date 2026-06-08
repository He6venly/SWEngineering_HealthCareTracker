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
@Document(collection = "ai_conversation_messages")
public class AiConversationMessage extends BaseDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String conversationId;

    private AiMessageRole role;

    private String content;

    private LocalDate targetDate;

    @Builder
    public AiConversationMessage(
            String userId,
            String conversationId,
            AiMessageRole role,
            String content,
            LocalDate targetDate
    ) {
        this.userId = userId;
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.targetDate = targetDate;
    }
}
