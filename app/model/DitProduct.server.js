import db from "../db.server";

/**
 * @param {{ shop: any; componentField?: any; enable?: any; image?: any; colorTypes?: any; productId?: any; productHandle?: any; productData?: any; }} data
 */
export async function createOrUpdate(data) {
    const update = {};
    switch (data?.componentField) {
        case 'enable':
            update.enable = data?.enable == 'true' ? true : false;
            break;
        case 'image':
            update.image = data?.image;
            break;
        case 'colorTypes':
            update.colorTypes = data?.colorTypes;
            break;
    }

    const result = await db.ditProduct.upsert({
        where: { productId: data?.productId },
        update,
        create: {
            shop: data?.shop,
            productId: data?.productId,
            productHandle: data?.productHandle,
            productData: data?.productData
        },
    });

    return result;
}

/**
 * @param {{ shop?: string; productId?: any; productHandle?: any; }} data
 */
export function validateProduct(data) {
    const errors = {};
    if (!data?.productId) {
        errors.product = 'Product id not found please try another product.'
    }
    if (!data?.productHandle) {
        errors.product = 'Product handle not found please try another product.'
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}