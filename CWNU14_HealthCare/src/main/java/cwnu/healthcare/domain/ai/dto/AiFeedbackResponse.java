package cwnu.healthcare.domain.ai.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AiFeedbackResponse(
        String feedbackId,
        LocalDate targetDate,
        String summary,
        String feedbackText,
        LocalDateTime createdAt
) {
}
