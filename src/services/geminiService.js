/* eslint-disable no-useless-catch */
import { post } from './MethodGeneral';

export const generateProductInfo = async (productName) => {
    try {
        const response = await post('gemini/generate-product-info', {
            product_name: productName
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
