// import { response } from "express";
import StatusCodes from "http-status-codes";
import Country from '../../db/models/country-state-city';
const getCountry = async (req, res) => {
    try {

        const collection = await Country.find({});
        const response = JSON.parse(JSON.stringify(collection));
        const obj = response[0].countryCode
// console.log(obj)
const response_data = [];
for (const key in obj) {
    response_data.push({
        countryCode:key,
        countyName: obj[key].name,
        countryFlag: obj[key].countryFlag,
        currencyCode: obj[key].currency
    })
}
       res.status(StatusCodes.OK).json({
        status: true,
        type: 'success',
        message:"Country Name Fetched",
        data: response_data
    });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            type: 'error',
            message: error.message
        });
    }
}
export default getCountry