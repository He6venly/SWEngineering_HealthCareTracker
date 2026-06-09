package cwnu.healthcare.domain.wellness.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SleepResponse(
        LocalDate recordDate,
        LocalTime sleepStartTime,
        LocalTime wakeTime,
        int durationMinutes
) {
}
