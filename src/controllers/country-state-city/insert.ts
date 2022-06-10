// /* eslint-disable @typescript-eslint/no-unused-vars */
// import yourhandle from 'countrycitystatejson';
// import StatusCodes from "http-status-codes";
// import Country from '../../db/models/country-state-city';
// const Insert_POST = async (req, res) => {
//     try {
//        const data = await yourhandle.getAll();
//        console.log(data,'data---');
//        const request = {countryCode: data}
//        const response = await Country.create(request);
//        console.log(response,'=====');
       
//        res.status(StatusCodes.OK).json({
//         status: true,
//         type: 'success',
//         message: "Insert Successfully"
//     });
//     } catch (error) {
//         console.log(error);
//         res.status(StatusCodes.BAD_REQUEST).json({
//             status: false,
//             type: 'error',
//             message: error.message
//         });
//     }
// }
// export default Insert_POST