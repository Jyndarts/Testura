import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError("");
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resp = (err as { response: { data: { message: string } } }).response;
        setServerError(resp.data.message || "Invalid email or password");
      } else {
        setServerError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#1e1e2e",
      }}
    >
      <div
        style={{
          background: "#313244",
          padding: "40px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            color: "#cdd6f4",
            fontSize: "24px",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            color: "#6c7086",
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          Log in to your account
        </p>

        {serverError && (
          <div
            style={{
              color: "#f38ba8",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "#cdd6f4",
              }}
            >
              Email
            </label>
            <input
              {...register("email")}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #45475a",
                borderRadius: "6px",
                background: "#1e1e2e",
                color: "#cdd6f4",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {errors.email && (
              <p style={{ color: "#f38ba8", fontSize: "12px", marginTop: "4px" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "#cdd6f4",
              }}
            >
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Your password"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #45475a",
                borderRadius: "6px",
                background: "#1e1e2e",
                color: "#cdd6f4",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {errors.password && (
              <p style={{ color: "#f38ba8", fontSize: "12px", marginTop: "4px" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              background: "#89b4fa",
              color: "#1e1e2e",
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p
          style={{
            color: "#6c7086",
            fontSize: "14px",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          Need an account?{" "}
          <Link
            to="/signup"
            style={{ color: "#89b4fa", textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
