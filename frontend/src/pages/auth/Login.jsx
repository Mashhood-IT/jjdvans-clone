import React, { useState } from "react";
import { toast } from "react-toastify";

import Icons from "../../assets/icons";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import UsePasswordToggle from "../../hooks/UsePasswordToggle";
import { setUser } from "../../redux/slice/authSlice";
import { useLoginUserMutation } from "../../redux/api/userApi";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    type: passwordType,
    visible: passwordVisible,
    toggleVisibility: togglePasswordVisibility,
  } = UsePasswordToggle();

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    try {
      const data = await loginUser({ email, password }).unwrap();
      dispatch(setUser(data));
      toast.success("Login successful!");

      navigate("/dashboard/my-dashboard");
    } catch (err) {
      const msg = err || "Login failed. Check your credentials.";
      console.log(err);
      toast.error(msg);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-var(--dark-grey) mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="xyz@gmail.com"
            className="w-full px-4 py-2 bg-(--lightest-gray) border border-[var(--light-gray)] rounded-lg placeholder-(--medium-grey) text-sm focus:outline-none focus:ring-2 focus:ring-(--main-color) focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-var(--dark-grey) mb-1"
          >
            Password
          </label>
          <input
            type={passwordType}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full px-4 py-2 pr-10 pt-2.5 bg-(--lightest-gray) border border-[var(--light-gray)] rounded-lg placeholder-(--medium-grey) text-sm focus:outline-none focus:ring-2 focus:ring-(--main-color) focus:border-transparent transition-all duration-200"
          />
          <span
            className="absolute top-1/2 right-3 transform translate-y-1/4 cursor-pointer text-(--medium-grey)"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <Icons.EyeOff size={18} />
            ) : (
              <Icons.Eye size={18} />
            )}
          </span>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer [background:var(--gradient-primary)] text-(--white) px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--main-color) transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <div className="text-center mt-3">
          <Link
            to="/forgot-password"
            className="text-(--link-color) text-md font-semibold underline cursor-pointer"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
