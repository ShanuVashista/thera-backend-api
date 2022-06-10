/* eslint-disable @typescript-eslint/no-unused-vars */
// import yourhandle from 'countrycitystatejson';
import StatusCodes from "http-status-codes";
import Country from '../../db/models/country-state-city';
const List_State_GET = async (req, res) => {
    try {
        let response_data = [];
        if(typeof (req.query.countryCode) != 'undefined' && req.query.countryCode != null){
            const code =req.query.countryCode;
            let response = await Country.aggregate([
                {$project:{[`countryCode.${code}`]:1}}
            ]);
            response = JSON.parse(JSON.stringify(response));
            const obj = response[0].countryCode;
            const state = [];
            if(Object.keys(obj).length !== 0){
            for (const key in obj[code].states) {
                state.push(key)
            }
            response_data = [{
                countryCode: code,
                countryName: obj[code].name,
                countryFlag: obj[code].countryFlag,
                states: state
            }]
        }
        }
        res.status(StatusCodes.OK).json({
            status: true,
            type: 'success',
            message: "State Get Successfully",
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
export default List_State_GET