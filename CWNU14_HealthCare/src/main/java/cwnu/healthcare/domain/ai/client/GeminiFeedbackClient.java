package cwnu.healthcare.domain.ai.client;

import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Primary
@Component
public class GeminiFeedbackClient implements LlmFeedbackClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiFeedbackClient.class);

    private final RuleBasedFeedbackClient fallbackClient;
    private final RestClient restClient;
    private final String provider;
    private final String apiKey;
    private final String model;
    private final String fallbackModels;

    public GeminiFeedbackClient(
            RuleBasedFeedbackClient fallbackClient,
            @Value("${llm.provider:rule}") String provider,
            @Value("${llm.gemini.api-key:}") String apiKey,
            @Value("${llm.gemini.model:gemini-2.5-flash}") String model,
            @Value("${llm.gemini.fallback-models:gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest}") String fallbackModels
    ) {
        this.fallbackClient = fallbackClient;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
        this.fallbackModels = fallbackModels;
    }

    @Override
    public String generateFeedback(String prompt, DashboardStatsDto stats) {
        if (!"gemini".equalsIgnoreCase(provider) || apiKey == null || apiKey.isBlank()) {
            log.info("Gemini disabled. provider={}, apiKeyConfigured={}", provider, apiKey != null && !apiKey.isBlank());
            return fallbackClient.generateFeedback(prompt, stats);
        }

        for (String candidateModel : getModelCandidates()) {
            try {
                GeminiResponse response = requestGemini(prompt, candidateModel);

                return extractText(response, stats);
            } catch (RestClientException exception) {
                log.warn("Gemini request failed. provider={}, model={}, reason={}", provider, candidateModel, exception.getMessage());
            }
        }

        return fallbackClient.generateFeedback(prompt, stats);
    }

    private GeminiResponse requestGemini(String prompt, String candidateModel) {
        return restClient.post()
                .uri("/v1beta/models/{model}:generateContent", candidateModel)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new GeminiRequest(
                        List.of(new Content(List.of(new Part(prompt)))),
                        new GenerationConfig(0.3, 1000)
                ))
                .retrieve()
                .body(GeminiResponse.class);
    }

    private List<String> getModelCandidates() {
        Set<String> candidates = new LinkedHashSet<>();
        if (model != null && !model.isBlank()) {
            candidates.add(model);
        }
        if (fallbackModels != null && !fallbackModels.isBlank()) {
            for (String fallbackModel : fallbackModels.split(",")) {
                if (!fallbackModel.isBlank()) {
                    candidates.add(fallbackModel.strip());
                }
            }
        }

        return List.copyOf(candidates);
    }

    private String extractText(GeminiResponse response, DashboardStatsDto stats) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return fallbackClient.generateFeedback("", stats);
        }

        Candidate candidate = response.candidates().getFirst();
        if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
            return fallbackClient.generateFeedback("", stats);
        }

        String text = candidate.content().parts()
                .stream()
                .map(Part::text)
                .filter(partText -> partText != null && !partText.isBlank())
                .reduce("", (current, partText) -> current + partText);
        if (text == null || text.isBlank()) {
            return fallbackClient.generateFeedback("", stats);
        }

        return text.trim();
    }

    private record GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {
    }

    private record Content(List<Part> parts) {
    }

    private record Part(String text) {
    }

    private record GenerationConfig(double temperature, int maxOutputTokens) {
    }

    private record GeminiResponse(List<Candidate> candidates) {
    }

    private record Candidate(Content content) {
    }
}
