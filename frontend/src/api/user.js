import axios from "../utlis/axiosInstance.js"

export const userDetails = async(data) => {
    const res = await axios.get('/api/user/data', data)
    return res.data
}