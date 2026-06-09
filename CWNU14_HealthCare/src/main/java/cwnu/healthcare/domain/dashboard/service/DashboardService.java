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
import cwnu.healthcare.domain.wellness.document.HydrationRecord;
import cwnu.healthcare.domain.wellness.document.SleepRecord;
import cwnu.healthcare.domain.wellness.repository.HydrationRecordRepository;
import cwnu.healthcare.domain.wellness.repository.SleepRecordRepository;
import cwnu.healthcare.domain.wellness.service.WellnessService;
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
    private final HydrationRecordRepository hydrationRecordRepository;
    private final SleepRecordRepository sleepRecordRepository;

    public DailyDashboardResponse getDailyStats(String userId, LocalDate date) {
        List<DietRecord> diets = dietRecordRepository.findByUserIdAndRecordDate(userId, date);
        List<ExerciseRecord> exercises = exerciseRecordRepository.findByUserIdAndRecordDate(userId, date);
        HydrationRecord hydration = hydrationRecordRepository.findByUserIdAndRecordDate(userId, date).orElse(null);
        SleepRecord sleep = sleepRecordRepository.findByUserIdAndRecordDate(userId, date).orElse(null);

        return new DailyDashboardResponse(date, buildStats(userId, diets, exercises, hydration, sleep));
    }

    public WeeklyDashboardResponse getWeeklySummary(String userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        List<DietRecord> diets = dietRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);
        List<ExerciseRecord> exercises = exerciseRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);
        List<HydrationRecord> hydrationRecords = hydrationRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);
        List<SleepRecord> sleepRecords = sleepRecordRepository.findByUserIdAndRecordDateRange(userId, startDate, endDate);

        Map<LocalDate, List<DietRecord>> dietsByDate = diets.stream()
                .collect(Collectors.groupingBy(DietRecord::getRecordDate));
        Map<LocalDate, List<ExerciseRecord>> exercisesByDate = exercises.stream()
                .collect(Collectors.groupingBy(ExerciseRecord::getRecordDate));
        Map<LocalDate, HydrationRecord> hydrationByDate = hydrationRecords.stream()
                .collect(Collectors.toMap(HydrationRecord::getRecordDate, record -> record));
        Map<LocalDate, SleepRecord> sleepByDate = sleepRecords.stream()
                .collect(Collectors.toMap(SleepRecord::getRecordDate, record -> record));

        List<DailyDashboardResponse> dailyStats = startDate.datesUntil(endDate.plusDays(1))
                .map(date -> new DailyDashboardResponse(
                        date,
                        buildStats(
                                userId,
                                dietsByDate.getOrDefault(date, List.of()),
                                exercisesByDate.getOrDefault(date, List.of()),
                                hydrationByDate.get(date),
                                sleepByDate.get(date)
                        )
                ))
                .toList();

        int weeklyWaterIntake = hydrationRecords.stream().mapToInt(HydrationRecord::getIntakeMl).sum();
        int weeklySleepMinutes = sleepRecords.stream().mapToInt(SleepRecord::getDurationMinutes).sum();
        DashboardStatsDto baseStats = buildStats(userId, diets, exercises, null, null);

        return new WeeklyDashboardResponse(
                startDate,
                endDate,
                new DashboardStatsDto(
                        baseStats.intakeCalories(),
                        baseStats.burnedCalories(),
                        baseStats.exerciseMinutes(),
                        baseStats.targetCalories(),
                        baseStats.calorieBalance(),
                        WellnessService.DEFAULT_HYDRATION_TARGET_ML * 7,
                        weeklyWaterIntake,
                        null,
                        null,
                        weeklySleepMinutes
                ),
                dailyStats
        );
    }

    private DashboardStatsDto buildStats(
            String userId,
            List<DietRecord> diets,
            List<ExerciseRecord> exercises,
            HydrationRecord hydration,
            SleepRecord sleep
    ) {
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
        int hydrationTargetMl = hydration == null ? WellnessService.DEFAULT_HYDRATION_TARGET_ML : hydration.getTargetMl();
        int waterIntakeMl = hydration == null ? 0 : hydration.getIntakeMl();
        String sleepStartTime = sleep == null ? null : sleep.getSleepStartTime().toString();
        String wakeTime = sleep == null ? null : sleep.getWakeTime().toString();
        int sleepMinutes = sleep == null ? 0 : sleep.getDurationMinutes();

        return new DashboardStatsDto(
                intakeCalories,
                burnedCalories,
                exerciseMinutes,
                targetCalories,
                intakeCalories - burnedCalories,
                hydrationTargetMl,
                waterIntakeMl,
                sleepStartTime,
                wakeTime,
                sleepMinutes
        );
    }
}
