/*
* Return a new object containing only the allowed fields from the original object
 */

export const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}