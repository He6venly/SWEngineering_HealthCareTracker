package cwnu.healthcare.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AiFeedbackRequest(
        @NotNull(message = "피드백 기준 날짜는 필수입니다.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate targetDate
) {
}
