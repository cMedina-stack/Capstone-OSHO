import { apiFetch } from "../shared/api";
import Locked from "../../../frontend/src/assets/icon/locked.png";
import envelope from "../../../frontend/src/assets/icon/envelope.png";
import bgPic from "../../../frontend/src/assets/logo/bgLogin.png";
import loginIcon from "../../../frontend/src/assets/icon/loginIcon.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save authentication information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "employee") {
        navigate("/employee/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid user role.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex h-screen w-full bg-[#8B1E23]">
        <section className="relative hidden h-full w-[50%] xl:flex">
          <div className="absolute z-20 flex h-full w-full flex-col items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <img src={loginIcon} alt="Logo" className="h-45 w-45" />
              <h1 className="text-8xl font-bold tracking-wide text-white uppercase">
                OSHO
              </h1>
              <h2 className="text-2xl font-semibold tracking-wide text-amber-300 uppercase">
                Occupational Safety & Health <br /> System
              </h2>
            </div>
            <div className="w-30 border border-amber-300"></div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">
                A Safer Campus. A Better Tomorrow.
              </h2>
              <span className="text-xl text-gray-300">
                Record, monitor, and assess occupational safety conditions
                <br />
                across the campus.
              </span>
            </div>
            <div>
              <div className="flex gap-8">
                <div className="flex flex-col items-center text-center">
                  <span className="mb-3 h-15 w-15 rounded-lg bg-[#731b20b0] p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="white"
                      className="size-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-amber-300">
                    Record
                  </h2>
                  <span className="font-semibold text-gray-300">
                    Maintain organized records <br /> of hazard, accidents, and
                    <br /> safety observations.
                  </span>
                </div>
                <span className="h-40 border border-[#731b20b0]"></span>
                <div className="flex flex-col items-center text-center">
                  <span className="mb-3 h-15 w-15 rounded-lg bg-[#731b20b0] p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="white"
                      className="size-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-amber-300">
                    Monitor
                  </h2>
                  <span className="font-semibold text-gray-300">
                    Track safety conditions <br /> and risk levels across
                    <br /> campus buildings.
                  </span>
                </div>
                <span className="h-40 border border-[#731b20b0]"></span>
                <div className="flex flex-col items-center text-center">
                  <span className="mb-3 h-15 w-15 rounded-lg bg-[#731b20b0] p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="white"
                      className="size-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-amber-300">
                    Record
                  </h2>
                  <span className="font-semibold text-gray-300">
                    Use safety data to support <br /> informed decisions and
                    <br /> preventive actions.
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-120 gap-2 rounded-lg border border-[#731b20b0] bg-[#440a0de8] p-3">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="size-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </span>
              <h2 className="flex flex-col font-semibold text-white">
                Safety is everyone's responsibility.
                <span className="text-sm font-normal text-gray-300">
                  Together, we build a safer and healthier workplace.
                </span>
              </h2>
            </div>
          </div>
          <div className="absolute z-10 h-full w-full">
            <img src={bgPic} alt="bg" />
          </div>
        </section>
        <section className="h-full w-full xl:w-[50%]">
          <div className="flex h-full w-full items-center justify-center bg-[#F8F6F2]">
            <div className="h-full w-full rounded-2xl border border-gray-300 bg-white p-8 shadow-lg md:h-[80%] md:w-[70%]">
              <div>
                <div className="mb-7 flex w-full flex-col items-center">
                  <div className="mb-5 rounded-full border border-gray-200 bg-[#F8F6F2] p-5">
                    <img src={Locked} alt="locked" className="h-10 w-10" />
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-[#651317]">
                    Welcome Back!
                  </h1>
                  <h2 className="font-semibold">
                    Please sign in to access your OSHO account.
                  </h2>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
                  >
                    {error}
                  </p>
                )}
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <span className="font-semibold">Institutional Email</span>
                    <div className="flex items-center gap-4 rounded-lg border border-gray-300 p-3 pr-4 pl-4 shadow">
                      <img src={envelope} alt="Envelope" className="h-6 w-6" />
                      <input
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="Enter your Institutional Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-lg font-semibold outline-0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="font-semibold">Password</span>
                    <div className="flex items-center gap-4 rounded-lg border border-gray-300 p-3 pr-4 pl-4 shadow">
                      <img src={Locked} alt="Locked" className="h-6 w-6" />
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Enter your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-lg font-semibold outline-0"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#651317] p-4 text-center text-lg font-semibold text-white"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
                <div className="flex items-center justify-between pt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Session lasts up to 24 hours
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setError(
                        "Please contact your campus OSHO administrator to reset your password.",
                      )
                    }
                    className="font-semibold text-[#651317]"
                  >
                    Forgot Password
                  </button>
                </div>
                <div className="mt-6">
                  <div className="mt-10 flex w-full items-center justify-center gap-2 border-t border-gray-300 pt-6 font-semibold">
                    <span>Don't have an account? </span>
                    <button
                      onClick={() =>
                        setError(
                          "Please contact your campus OSHO office to request an account.",
                        )
                      }
                      className="text-[#651317]"
                    >
                      Contact Administrator
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
