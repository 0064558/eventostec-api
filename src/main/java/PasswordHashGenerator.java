import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        String raw = args.length > 0 ? args[0] : System.getenv("RAW_PASSWORD");
        if (raw == null || raw.isBlank()) {
            System.err.println("Usage: PasswordHashGenerator <password> or set RAW_PASSWORD");
            System.exit(1);
        }

        PasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode(raw));
    }
}
