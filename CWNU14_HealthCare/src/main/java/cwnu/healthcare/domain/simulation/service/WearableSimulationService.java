package cwnu.healthcare.domain.simulation.service;

import cwnu.healthcare.domain.activity.dto.ActivityResponse;
import cwnu.healthcare.domain.activity.dto.ExerciseRecordRequest;
import cwnu.healthcare.domain.activity.service.ActivityService;
import cwnu.healthcare.domain.activity.type.ExerciseSource;
import cwnu.healthcare.domain.simulation.document.RawWearableData;
import cwnu.healthcare.domain.simulation.dto.WearableSimulationRequest;
import cwnu.healthcare.domain.simulation.dto.WearableSimulationResponse;
import cwnu.healthcare.domain.simulation.repository.RawWearableDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WearableSimulationService {

    private final RawWearableDataRepository rawWearableDataRepository;
    private final ActivityService activityService;

    public WearableSimulationResponse syncWearableData(String userId, WearableSimulationRequest request) {
        int caloriesBurned = calculateCaloriesBurned(request);

        RawWearableData rawWearableData = RawWearableData.builder()
                .userId(userId)
                .stepCount(request.getStepCount())
                .averageHeartRate(request.getAverageHeartRate())
                .durationMinutes(request.getDurationMinutes())
                .caloriesBurned(caloriesBurned)
                .recordDate(request.getRecordDate())
                .build();

        rawWearableDataRepository.save(rawWearableData);

        ExerciseRecordRequest exerciseRequest = ExerciseRecordRequest.builder()
                .exerciseName("Wearable Sync Exercise")
                .durationMinutes(request.getDurationMinutes())
                .caloriesBurned(caloriesBurned)
                .source(ExerciseSource.WEARABLE)
                .recordDate(request.getRecordDate())
                .build();

        ActivityResponse activityResponse = activityService.addExercise(userId, exerciseRequest);

        return WearableSimulationResponse.builder()
                .syncStatus("SUCCESS")
                .processedCaloriesBurned(caloriesBurned)
                .durationMinutes(request.getDurationMinutes())
                .exerciseRecordId(activityResponse.getRecordId())
                .recordDate(request.getRecordDate())
                .build();
    }

    private int calculateCaloriesBurned(WearableSimulationRequest request) {
        return Math.max(1, request.getStepCount() / 20 + request.getDurationMinutes() * 5);
    }
}
