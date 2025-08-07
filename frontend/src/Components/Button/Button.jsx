import React from 'react'

const Button = ({
    className = "",
    children = "",
    type = ""
}) => {
    return <button className={`${className} hover:cursor-pointer hover:scale-105 bg-slate-300 text-blue-500 px-5 py-2 text-lg font-medium rounded-md`} type={type}>
        {children}
    </button>
}

export default Button
