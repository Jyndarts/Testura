import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string): { label: string; className: string } {
  if (!password) return { label: "", className: "" };
  const types = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  if (types < 2) return { label: "Weak", className: "strength-weak" };
  if (types < 3) return { label: "OK", className: "strength-ok" };
  return { label: "Strong", className: "strength-strong" };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  async function onSubmit(data: SignupForm) {
    setServerError("");
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const resp = (err as { response: { data: { message: string } } }).response;
        setServerError(resp.data.message || "Signup failed");
      } else {
        setServerError("Signup failed");
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
          Create Account
        </h1>
        <p
          style={{
            color: "#6c7086",
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          Sign up to get started
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
              Name
            </label>
            <input
              {...register("name")}
              placeholder="Your name"
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
            {errors.name && (
              <p style={{ color: "#f38ba8", fontSize: "12px", marginTop: "4px" }}>
                {errors.name.message}
              </p>
            )}
          </div>

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

          <div style={{ marginBottom: "16px" }}>
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
              placeholder="Min 8 characters"
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
            {password && (
              <>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    marginTop: "4px",
                    transition: "all 0.3s",
                    background:
                      strength.className === "strength-weak"
                        ? "#f38ba8"
                        : strength.className === "strength-ok"
                          ? "#f9e2af"
                          : "#a6e3a1",
                    width:
                      strength.className === "strength-weak"
                        ? "33%"
                        : strength.className === "strength-ok"
                          ? "66%"
                          : "100%",
                  }}
                />
                <p
                  style={{
                    color: "#6c7086",
                    fontSize: "12px",
                    marginTop: "2px",
                    textAlign: "right",
                  }}
                >
                  {strength.label}
                </p>
              </>
            )}
            {errors.password && (
              <p style={{ color: "#f38ba8", fontSize: "12px", marginTop: "4px" }}>
                {errors.password.message}
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
              Confirm Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Repeat your password"
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
            {errors.confirmPassword && (
              <p style={{ color: "#f38ba8", fontSize: "12px", marginTop: "4px" }}>
                {errors.confirmPassword.message}
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
            {loading ? "Creating account..." : "Sign Up"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#89b4fa", textDecoration: "none" }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
