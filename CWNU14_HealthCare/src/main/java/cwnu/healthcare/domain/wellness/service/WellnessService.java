package cwnu.healthcare.domain.wellness.service;

import cwnu.healthcare.domain.wellness.document.HydrationRecord;
import cwnu.healthcare.domain.wellness.document.SleepRecord;
import cwnu.healthcare.domain.wellness.dto.HydrationAddRequest;
import cwnu.healthcare.domain.wellness.dto.HydrationResponse;
import cwnu.healthcare.domain.wellness.dto.HydrationTargetRequest;
import cwnu.healthcare.domain.wellness.dto.SleepRecordRequest;
import cwnu.healthcare.domain.wellness.dto.SleepResponse;
import cwnu.healthcare.domain.wellness.repository.HydrationRecordRepository;
import cwnu.healthcare.domain.wellness.repository.SleepRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WellnessService {
    public static final int DEFAULT_HYDRATION_TARGET_ML = 2000;

    private final HydrationRecordRepository hydrationRecordRepository;
    private final SleepRecordRepository sleepRecordRepository;

    public HydrationResponse getHydration(String userId, LocalDate recordDate) {
        return hydrationRecordRepository.findByUserIdAndRecordDate(userId, recordDate)
                .map(this::toHydrationResponse)
                .orElse(new HydrationResponse(recordDate, DEFAULT_HYDRATION_TARGET_ML, 0));
    }

    public HydrationResponse updateHydrationTarget(String userId, HydrationTargetRequest request) {
        HydrationRecord record = getOrCreateHydrationRecord(userId, request.recordDate());
        record.updateTarget(request.targetMl());

        return toHydrationResponse(hydrationRecordRepository.save(record));
    }

    public HydrationResponse addHydration(String userId, HydrationAddRequest request) {
        HydrationRecord record = getOrCreateHydrationRecord(userId, request.recordDate());
        record.addIntake(request.amountMl());

        return toHydrationResponse(hydrationRecordRepository.save(record));
    }

    public SleepResponse getSleep(String userId, LocalDate recordDate) {
        return sleepRecordRepository.findByUserIdAndRecordDate(userId, recordDate)
                .map(this::toSleepResponse)
                .orElse(new SleepResponse(recordDate, null, null, 0));
    }

    public SleepResponse saveSleep(String userId, SleepRecordRequest request) {
        int durationMinutes = calculateSleepMinutes(request.recordDate(), request.sleepStartTime(), request.wakeTime());
        SleepRecord record = sleepRecordRepository.findByUserIdAndRecordDate(userId, request.recordDate())
                .map(existingRecord -> {
                    existingRecord.update(request.sleepStartTime(), request.wakeTime(), durationMinutes);
                    return existingRecord;
                })
                .orElseGet(() -> SleepRecord.builder()
                        .userId(userId)
                        .recordDate(request.recordDate())
                        .sleepStartTime(request.sleepStartTime())
                        .wakeTime(request.wakeTime())
                        .durationMinutes(durationMinutes)
                        .build());

        return toSleepResponse(sleepRecordRepository.save(record));
    }

    private HydrationRecord getOrCreateHydrationRecord(String userId, LocalDate recordDate) {
        return hydrationRecordRepository.findByUserIdAndRecordDate(userId, recordDate)
                .orElseGet(() -> HydrationRecord.builder()
                        .userId(userId)
                        .recordDate(recordDate)
                        .targetMl(DEFAULT_HYDRATION_TARGET_ML)
                        .intakeMl(0)
                        .build());
    }

    public int calculateSleepMinutes(LocalDate recordDate, java.time.LocalTime sleepStartTime, java.time.LocalTime wakeTime) {
        LocalDateTime sleepStart = LocalDateTime.of(recordDate, sleepStartTime);
        LocalDateTime wake = LocalDateTime.of(recordDate, wakeTime);
        if (!wake.isAfter(sleepStart)) {
            wake = wake.plusDays(1);
        }

        return (int) Duration.between(sleepStart, wake).toMinutes();
    }

    private HydrationResponse toHydrationResponse(HydrationRecord record) {
        return new HydrationResponse(record.getRecordDate(), record.getTargetMl(), record.getIntakeMl());
    }

    private SleepResponse toSleepResponse(SleepRecord record) {
        return new SleepResponse(
                record.getRecordDate(),
                record.getSleepStartTime(),
                record.getWakeTime(),
                record.getDurationMinutes()
        );
    }
}
