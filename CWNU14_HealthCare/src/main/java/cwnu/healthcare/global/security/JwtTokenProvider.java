package cwnu.healthcare.global.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Component
public class JwtTokenProvider {

	private static final ObjectMapper objectMapper = new ObjectMapper();
	private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();
	private static final Base64.Decoder base64Decoder = Base64.getUrlDecoder();

	private final String secretKey;
	private final long validityInSeconds;

	public JwtTokenProvider(
		@Value("${jwt.secret:local-development-secret-key}") String secretKey,
		@Value("${jwt.validity-in-seconds:86400}") long validityInSeconds
	) {
		this.secretKey = secretKey;
		this.validityInSeconds = validityInSeconds;
	}

	public String createToken(String userId) {
		long issuedAt = Instant.now().getEpochSecond();
		long expiresAt = issuedAt + validityInSeconds;

		Map<String, Object> header = Map.of(
			"alg", "HS256",
			"typ", "JWT"
		);

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("sub", userId);
		payload.put("iat", issuedAt);
		payload.put("exp", expiresAt);

		String unsignedToken = encode(header) + "." + encode(payload);
		return unsignedToken + "." + sign(unsignedToken);
	}

	public boolean validateToken(String token) {
		try {
			String[] parts = token.split("\\.");
			if (parts.length != 3) {
				return false;
			}

			String unsignedToken = parts[0] + "." + parts[1];
			String expectedSignature = sign(unsignedToken);
			boolean signatureValid = MessageDigest.isEqual(
				expectedSignature.getBytes(StandardCharsets.UTF_8),
				parts[2].getBytes(StandardCharsets.UTF_8)
			);

			if (!signatureValid) {
				return false;
			}

			Number expiresAt = (Number) parsePayload(token).get("exp");
			return expiresAt.longValue() > Instant.now().getEpochSecond();
		} catch (RuntimeException exception) {
			return false;
		}
	}

	public String getSubject(String token) {
		return (String) parsePayload(token).get("sub");
	}

	private String encode(Map<String, Object> value) {
		try {
			return base64Encoder.encodeToString(objectMapper.writeValueAsBytes(value));
		} catch (Exception exception) {
			throw new IllegalStateException("JWT 인코딩에 실패했습니다.", exception);
		}
	}

	private Map<String, Object> parsePayload(String token) {
		try {
			String payload = token.split("\\.")[1];
			byte[] decodedPayload = base64Decoder.decode(payload);
			return objectMapper.readValue(decodedPayload, new TypeReference<>() {
			});
		} catch (Exception exception) {
			throw new IllegalArgumentException("JWT 페이로드 파싱에 실패했습니다.", exception);
		}
	}

	private String sign(String value) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
			mac.init(keySpec);
			return base64Encoder.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception exception) {
			throw new IllegalStateException("JWT 서명에 실패했습니다.", exception);
		}
	}
}
