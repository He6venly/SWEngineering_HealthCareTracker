package cwnu.healthcare.domain.activity.service;

import cwnu.healthcare.domain.activity.document.DietRecord;
import cwnu.healthcare.domain.activity.document.ExerciseRecord;
import cwnu.healthcare.domain.activity.dto.ActivityResponse;
import cwnu.healthcare.domain.activity.dto.DietRecordRequest;
import cwnu.healthcare.domain.activity.dto.ExerciseRecordRequest;
import cwnu.healthcare.domain.activity.repository.DietRecordRepository;
import cwnu.healthcare.domain.activity.repository.ExerciseRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final DietRecordRepository dietRecordRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;

    public ActivityResponse addDiet(String userId, DietRecordRequest request) {
        DietRecord dietRecord = DietRecord.builder()
                .userId(userId)
                .mealType(request.getMealType())
                .foodName(request.getFoodName())
                .calories(request.getCalories())
                .recordDate(request.getRecordDate())
                .build();

        DietRecord savedRecord = dietRecordRepository.save(dietRecord);
        return toDietResponse(savedRecord);
    }

    public ActivityResponse addExercise(String userId, ExerciseRecordRequest request) {
        ExerciseRecord exerciseRecord = ExerciseRecord.builder()
                .userId(userId)
                .exerciseName(request.getExerciseName())
                .durationMinutes(request.getDurationMinutes())
                .caloriesBurned(request.getCaloriesBurned())
                .source(request.getSource())
                .recordDate(request.getRecordDate())
                .build();

        ExerciseRecord savedRecord = exerciseRecordRepository.save(exerciseRecord);
        return toExerciseResponse(savedRecord);
    }

    public List<ActivityResponse> getActivities(String userId, LocalDate date) {
        List<ActivityResponse> responses = new ArrayList<>();

        responses.addAll(dietRecordRepository.findByUserIdAndRecordDate(userId, date)
                .stream()
                .map(this::toDietResponse)
                .toList());

        responses.addAll(exerciseRecordRepository.findByUserIdAndRecordDate(userId, date)
                .stream()
                .map(this::toExerciseResponse)
                .toList());

        return responses;
    }

    private ActivityResponse toDietResponse(DietRecord record) {
        return ActivityResponse.builder()
                .recordId(record.getId())
                .type("DIET")
                .name(record.getFoodName())
                .calories(record.getCalories())
                .durationMinutes(null)
                .mealType(record.getMealType())
                .source(null)
                .recordDate(record.getRecordDate())
                .build();
    }

    private ActivityResponse toExerciseResponse(ExerciseRecord record) {
        return ActivityResponse.builder()
                .recordId(record.getId())
                .type("EXERCISE")
                .name(record.getExerciseName())
                .calories(record.getCaloriesBurned())
                .durationMinutes(record.getDurationMinutes())
                .mealType(null)
                .source(record.getSource())
                .recordDate(record.getRecordDate())
                .build();
    }
}
