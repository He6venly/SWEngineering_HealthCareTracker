package cwnu.healthcare.domain.simulation.controller;

import cwnu.healthcare.domain.simulation.dto.WearableSimulationRequest;
import cwnu.healthcare.domain.simulation.dto.WearableSimulationResponse;
import cwnu.healthcare.domain.simulation.service.WearableSimulationService;
import cwnu.healthcare.global.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/simulation")
public class WearableSimulationController {

    private final WearableSimulationService wearableSimulationService;

    public WearableSimulationController(WearableSimulationService wearableSimulationService) {
        this.wearableSimulationService = wearableSimulationService;
    }

    @PostMapping("/wearable")
    public ApiResponse<WearableSimulationResponse> syncWearableData(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody WearableSimulationRequest request
    ) {
        WearableSimulationResponse response = wearableSimulationService.syncWearableData(userId, request);
        return ApiResponse.success(response);
    }
}
