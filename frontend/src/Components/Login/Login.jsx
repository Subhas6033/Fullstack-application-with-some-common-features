import React from "react";
import Button from "../Button/Button";
import axios from "axios";
import { useForm } from "react-hook-form";

const Login = () => {

    const {register, handleSubmit, reset} = useForm()

    const onSbumit = async(data) => {
        // const formData = new FormData()
        // formData.append("userName", data.userName)
        // formData.append("email", data.email)
        // formData.append("password", data.password)
        try {
            axios.post(
              "http://localhost:8000/api/v1/users/login",
                //   formData,
                {
                    userName: data.userName,
                    email: data.email,
                    password : data.password
            },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
              data
            );
            console.log("Successfully logged in ", data.userName)
            // reset()

        } catch (error) {
            console.log("Error while login from frontend", error)
        }
    }


  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onSbumit)}
        className="flex flex-col justify-center items-center gap-5 bg-white/15 rounded-2xl p-10 min-h-96 min-w-96"
      >
        <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-black font-medium">
          Login
        </h1>
        <div className="flex flex-col justify-center items-center gap-5">
          <div className="">
            <input
              {...register("userName")}
              type="text"
              placeholder="Enter your user name"
              className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
            />
          </div>

          <div>
            <input
              {...register("email")}
              type="text"
              placeholder="Enter your email"
              className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
            />
          </div>
          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter Your Password"
              className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-slate-300 text-blue-600 rounded-md focus:outline-none py-2 text-lg font-medium w-40 hover:cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
            >
              login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
