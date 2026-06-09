package cwnu.healthcare.domain.wellness.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record HydrationAddRequest(
        @NotNull LocalDate recordDate,
        @NotNull @Positive Integer amountMl
) {
}
