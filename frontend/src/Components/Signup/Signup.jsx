import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../index";

const Signup = () => {



  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("userName", data.userName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar[0]);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
        data,
      );
      reset()
      console.log("Successfully Registered", response.data);
    } catch (error) {
      console.log("Error while submiting the form", error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white flex justify-center items-center">
      <div className="text-center bg-white/15 p-10 rounded-2xl ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center gap-5"
        >
          <h1 className="text-4xl underline decoration-white text-transparent bg-clip-text bg-gradient-to-l from-white to-black">
            Sign up
          </h1>
          <input
            {...register("fullName")}
            type="text"
            placeholder="Enter Your Name : "
            className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
          />

          <input
            {...register("userName")}
            type="text"
            placeholder="Enter Your user name : "
            className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
          />
          <input
            {...register("email")}
            type="text"
            placeholder="Enter your Email"
            className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
          />

          <input
            {...register("password")}
            type="password"
            placeholder="Enter Your Password : "
            className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
          />

          <input
            {...register("avatar")}
            type="file"
            placeholder="Upload your avatar : "
            className="border px-2 py-3 rounded-md bg-slate-400 text-black w-96 focus:outline-none"
          />

          <button
            type="submit"
            className="bg-slate-300 text-blue-600 rounded-md focus:outline-none py-2 text-lg font-medium w-40 hover:cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Submit
          </button>
        </form>
        <p className="mt-5">
          Already have account? {" "}
          <Link to={'/login'}>
            <Button>
            login
            </Button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
