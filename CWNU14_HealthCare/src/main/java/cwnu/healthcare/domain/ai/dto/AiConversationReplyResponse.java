package cwnu.healthcare.domain.ai.dto;

public record AiConversationReplyResponse(
        AiConversationSummaryResponse conversation,
        AiConversationMessageResponse userMessage,
        AiConversationMessageResponse assistantMessage
) {
}
