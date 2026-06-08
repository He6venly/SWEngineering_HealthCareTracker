package cwnu.healthcare.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AiFeedbackRequest(
        @NotNull(message = "피드백 기준 날짜는 필수입니다.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate targetDate,

        @Size(max = 500, message = "질문은 500자 이하로 입력해주세요.")
        String userPrompt
) {
}
