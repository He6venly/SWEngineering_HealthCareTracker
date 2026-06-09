package cwnu.healthcare.domain.ai.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AiConversationSummaryResponse(
        String conversationId,
        String title,
        LocalDate targetDate,
        String lastMessagePreview,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
