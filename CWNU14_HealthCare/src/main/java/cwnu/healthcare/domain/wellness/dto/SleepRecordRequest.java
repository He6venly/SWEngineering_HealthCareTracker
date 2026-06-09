package cwnu.healthcare.domain.wellness.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record SleepRecordRequest(
        @NotNull LocalDate recordDate,
        @NotNull LocalTime sleepStartTime,
        @NotNull LocalTime wakeTime
) {
}
