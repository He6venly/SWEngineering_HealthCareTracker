package cwnu.healthcare.domain.ai.controller;

import cwnu.healthcare.domain.ai.dto.AiFeedbackRequest;
import cwnu.healthcare.domain.ai.dto.AiFeedbackResponse;
import cwnu.healthcare.domain.ai.service.AiFeedbackService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/feedback")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiFeedbackService aiFeedbackService;

    @PostMapping
    public ApiResponse<AiFeedbackResponse> requestFeedback(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AiFeedbackRequest request
    ) {
        return ApiResponse.success(aiFeedbackService.generateFeedback(userId, request));
    }

    @GetMapping("/history")
    public ApiResponse<List<AiFeedbackResponse>> getHistory(@AuthenticationPrincipal String userId) {
        return ApiResponse.success(aiFeedbackService.getHistory(userId));
    }
}
