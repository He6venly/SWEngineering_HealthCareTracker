package cwnu.healthcare.domain.dashboard.service;

import cwnu.healthcare.domain.activity.document.DietRecord;
import cwnu.healthcare.domain.activity.document.ExerciseRecord;
import cwnu.healthcare.domain.activity.repository.DietRecordRepository;
import cwnu.healthcare.domain.activity.repository.ExerciseRecordRepository;
import cwnu.healthcare.domain.dashboard.dto.DailyDashboardResponse;
import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;
import cwnu.healthcare.domain.dashboard.dto.WeeklyDashboardResponse;
import cwnu.healthcare.domain.profile.document.HealthProfile;
import cwnu.healthcare.domain.profile.repository.HealthProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DietRecordRepository dietRecordRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;
    private final HealthProfileRepository healthProfileRepository;

    public DailyDashboardResponse getDailyStats(String userId, LocalDate date) {
        List<DietRecord> diets = dietRecordRepository.findByUserIdAndRecordDate(userId, date);
        List<ExerciseRecord> exercises = exerciseRecordRepository.findByUserIdAndRecordDate(userId, date);

        return new DailyDashboardResponse(date, buildStats(userId, diets, exercises));
    }

    public WeeklyDashboardResponse getWeeklySummary(String userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        List<DietRecord> diets = dietRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);
        List<ExerciseRecord> exercises = exerciseRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);

        Map<LocalDate, List<DietRecord>> dietsByDate = diets.stream()
                .collect(Collectors.groupingBy(DietRecord::getRecordDate));
        Map<LocalDate, List<ExerciseRecord>> exercisesByDate = exercises.stream()
                .collect(Collectors.groupingBy(ExerciseRecord::getRecordDate));

        List<DailyDashboardResponse> dailyStats = startDate.datesUntil(endDate.plusDays(1))
                .map(date -> new DailyDashboardResponse(
                        date,
                        buildStats(
                                userId,
                                dietsByDate.getOrDefault(date, List.of()),
                                exercisesByDate.getOrDefault(date, List.of())
                        )
                ))
                .toList();

        return new WeeklyDashboardResponse(startDate, endDate, buildStats(userId, diets, exercises), dailyStats);
    }

    private DashboardStatsDto buildStats(String userId, List<DietRecord> diets, List<ExerciseRecord> exercises) {
        int intakeCalories = diets.stream()
                .mapToInt(DietRecord::getCalories)
                .sum();
        int burnedCalories = exercises.stream()
                .mapToInt(ExerciseRecord::getCaloriesBurned)
                .sum();
        int exerciseMinutes = exercises.stream()
                .mapToInt(ExerciseRecord::getDurationMinutes)
                .sum();
        int targetCalories = healthProfileRepository.findByUserId(userId)
                .map(HealthProfile::getTargetCalories)
                .orElse(0);

        return new DashboardStatsDto(
                intakeCalories,
                burnedCalories,
                exerciseMinutes,
                targetCalories,
                intakeCalories - burnedCalories
        );
    }
}
