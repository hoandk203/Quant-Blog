import axios from "axios";

export const getAllCategories = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    return response.data;
}
