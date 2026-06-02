package cwnu.healthcare.domain.simulation.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WearableSimulationResponse {

    private String syncStatus;

    private int processedCaloriesBurned;

    private int durationMinutes;

    private String exerciseRecordId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;
}
