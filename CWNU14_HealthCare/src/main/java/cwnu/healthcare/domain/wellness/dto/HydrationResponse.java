package cwnu.healthcare.domain.wellness.dto;

import java.time.LocalDate;

public record HydrationResponse(
        LocalDate recordDate,
        int targetMl,
        int intakeMl
) {
}
