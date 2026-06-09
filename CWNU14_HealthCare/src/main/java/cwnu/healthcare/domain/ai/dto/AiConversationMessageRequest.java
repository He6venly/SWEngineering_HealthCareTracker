package cwnu.healthcare.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AiConversationMessageRequest(
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate targetDate,

        @NotBlank(message = "질문 내용은 필수입니다.")
        @Size(max = 500, message = "질문은 500자 이하로 입력해주세요.")
        String message
) {
}
