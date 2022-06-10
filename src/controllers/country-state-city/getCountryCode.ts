/* eslint-disable @typescript-eslint/no-unused-vars */
import yourhandle from 'countrycitystatejson';
import StatusCodes from "http-status-codes";
import Country from '../../db/models/country-state-city';
const List_GET = async (req, res) => {
    try {
        let response = await Country.find({});
        response = JSON.parse(JSON.stringify(response));
        const obj = response[0].countryCode;
        const response_data = [];
        for (const key in obj) {
            response_data.push({
                countryCode:key,
                countryName: obj[key].name,
                dialCode: obj[key].phone,
                countryFlag: obj[key].countryFlag,
                currencyCode: obj[key].currency
            })

        }
        res.status(StatusCodes.OK).json({
            status: true,
            type: 'success',
            message: "Dial Code Get Successfully",
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
export default List_GET