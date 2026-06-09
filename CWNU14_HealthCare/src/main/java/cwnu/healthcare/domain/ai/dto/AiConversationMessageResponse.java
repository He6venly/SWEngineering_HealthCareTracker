package cwnu.healthcare.domain.ai.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AiConversationMessageResponse(
        String messageId,
        String role,
        String content,
        LocalDate targetDate,
        LocalDateTime createdAt
) {
}
