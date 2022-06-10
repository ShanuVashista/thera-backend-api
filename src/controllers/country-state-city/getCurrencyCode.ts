/* eslint-disable @typescript-eslint/no-unused-vars */
// import yourhandle from 'countrycitystatejson';
import StatusCodes from "http-status-codes";
import Currency from '../../db/models/country-state-city';
const Currency_Code_GET = async (req, res) => {
    try {
        let response_data = [];
        if(typeof (req.query.countryCode) != 'undefined' && req.query.countryCode != null){
            const code =req.query.countryCode;
            let response = await Currency.aggregate([
                {$project:{[`countryCode.${code}`]:1}}
            ]);
            response = JSON.parse(JSON.stringify(response));
            const obj = response[0].countryCode;
            
            if(Object.keys(obj).length !== 0){
                response_data = [{
                    countryCode: code,
                    countryName: obj[code].name,
                    countryFlag: obj[code].countryFlag,
                    currencyCode: obj[code].currency
                }]
            }
        }
        res.status(StatusCodes.OK).json({
            status: true,
            type: 'success',
            message: "Currency Get Successfully",
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
export default Currency_Code_GET