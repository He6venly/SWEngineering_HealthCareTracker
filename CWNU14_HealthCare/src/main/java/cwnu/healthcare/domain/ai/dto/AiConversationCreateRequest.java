package cwnu.healthcare.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public record AiConversationCreateRequest(
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate targetDate,
        String title
) {
}
