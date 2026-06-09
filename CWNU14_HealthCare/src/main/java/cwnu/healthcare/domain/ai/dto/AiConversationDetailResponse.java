package cwnu.healthcare.domain.ai.dto;

import java.util.List;

public record AiConversationDetailResponse(
        AiConversationSummaryResponse conversation,
        List<AiConversationMessageResponse> messages
) {
}
