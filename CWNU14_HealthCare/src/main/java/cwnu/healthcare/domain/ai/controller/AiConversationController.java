package cwnu.healthcare.domain.ai.controller;

import cwnu.healthcare.domain.ai.dto.AiConversationCreateRequest;
import cwnu.healthcare.domain.ai.dto.AiConversationDetailResponse;
import cwnu.healthcare.domain.ai.dto.AiConversationMessageRequest;
import cwnu.healthcare.domain.ai.dto.AiConversationReplyResponse;
import cwnu.healthcare.domain.ai.dto.AiConversationSummaryResponse;
import cwnu.healthcare.domain.ai.service.AiConversationService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/conversations")
@RequiredArgsConstructor
public class AiConversationController {

    private final AiConversationService aiConversationService;

    @GetMapping
    public ApiResponse<List<AiConversationSummaryResponse>> getConversations(@AuthenticationPrincipal String userId) {
        return ApiResponse.success(aiConversationService.getConversations(userId));
    }

    @PostMapping
    public ApiResponse<AiConversationDetailResponse> createConversation(
            @AuthenticationPrincipal String userId,
            @RequestBody AiConversationCreateRequest request
    ) {
        return ApiResponse.success(aiConversationService.createConversation(userId, request));
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<AiConversationDetailResponse> getConversation(
            @AuthenticationPrincipal String userId,
            @PathVariable String conversationId
    ) {
        return ApiResponse.success(aiConversationService.getConversation(userId, conversationId));
    }

    @PostMapping("/{conversationId}/messages")
    public ApiResponse<AiConversationReplyResponse> addMessage(
            @AuthenticationPrincipal String userId,
            @PathVariable String conversationId,
            @Valid @RequestBody AiConversationMessageRequest request
    ) {
        return ApiResponse.success(aiConversationService.addMessage(userId, conversationId, request));
    }

    @DeleteMapping("/{conversationId}")
    public ApiResponse<Void> deleteConversation(
            @AuthenticationPrincipal String userId,
            @PathVariable String conversationId
    ) {
        aiConversationService.deleteConversation(userId, conversationId);
        return ApiResponse.success(null);
    }
}
