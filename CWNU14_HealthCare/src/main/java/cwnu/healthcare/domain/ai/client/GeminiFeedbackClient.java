package cwnu.healthcare.domain.ai.client;

import cwnu.healthcare.domain.dashboard.dto.DashboardStatsDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Primary
@Component
public class GeminiFeedbackClient implements LlmFeedbackClient {

    private final RuleBasedFeedbackClient fallbackClient;
    private final RestClient restClient;
    private final String provider;
    private final String apiKey;
    private final String model;

    public GeminiFeedbackClient(
            RuleBasedFeedbackClient fallbackClient,
            @Value("${llm.provider:rule}") String provider,
            @Value("${llm.gemini.api-key:}") String apiKey,
            @Value("${llm.gemini.model:gemini-2.5-flash}") String model
    ) {
        this.fallbackClient = fallbackClient;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public String generateFeedback(String prompt, DashboardStatsDto stats) {
        if (!"gemini".equalsIgnoreCase(provider) || apiKey == null || apiKey.isBlank()) {
            return fallbackClient.generateFeedback(prompt, stats);
        }

        try {
            GeminiResponse response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new GeminiRequest(
                            List.of(new Content(List.of(new Part(prompt)))),
                            new GenerationConfig(0.4, 300)
                    ))
                    .retrieve()
                    .body(GeminiResponse.class);

            return extractText(response, stats);
        } catch (RestClientException exception) {
            return fallbackClient.generateFeedback(prompt, stats);
        }
    }

    private String extractText(GeminiResponse response, DashboardStatsDto stats) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return fallbackClient.generateFeedback("", stats);
        }

        Candidate candidate = response.candidates().getFirst();
        if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
            return fallbackClient.generateFeedback("", stats);
        }

        String text = candidate.content().parts().getFirst().text();
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
