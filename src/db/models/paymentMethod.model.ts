/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from 'mongoose';
import { PaymentMethodEnum } from '../../lib/PaymentMethodEnum';
import { IUser } from './user';

// create an interface with meta data for the payment method
interface MetaPaymentMethod {
    type: PaymentMethodEnum;
    userId: mongoose.PopulatedDoc<IUser>;
}

interface card extends MetaPaymentMethod {
    card_number: string;
    card_name: string;
    card_expiry: string;
    card_cvv: string;
}

interface bank extends MetaPaymentMethod {
    bank_name: string;
    account_number: string;
    account_name: string;
    account_type: string;
    ifsc_code: string;
}

interface health_card extends MetaPaymentMethod {
    health_card_number: string;
}

export type IPaymentMethod = NonNullable<bank | card | health_card>;

const isType = function (type: PaymentMethodEnum) {
    return function (this: IPaymentMethod) {
        return this.type === type;
    };
};

const obfuscate = (value: string | undefined): string =>
    value?.replace(/.(?=.{4})/g, '*');

const paymentMethodSchema = new mongoose.Schema<IPaymentMethod>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        bank_name: {
            type: String,
            required: isType(PaymentMethodEnum.BANK),
        },
        account_number: {
            type: String,
            required: isType(PaymentMethodEnum.BANK),
            get: obfuscate,
        },
        account_name: {
            type: String,
            required: isType(PaymentMethodEnum.BANK),
        },
        account_type: {
            type: String,
            required: isType(PaymentMethodEnum.BANK),
        },
        ifsc_code: {
            type: String,
            required: isType(PaymentMethodEnum.BANK),
        },
        card_number: {
            type: String,
            required: isType(PaymentMethodEnum.CARD),
            get: obfuscate,
        },
        card_name: {
            type: String,
            required: isType(PaymentMethodEnum.CARD),
        },
        card_expiry: {
            type: String,
            required: isType(PaymentMethodEnum.CARD),
        },
        card_cvv: {
            type: String,
            required: isType(PaymentMethodEnum.CARD),
        },
        health_card_number: {
            type: String,
            required: isType(PaymentMethodEnum.HEALTH_CARD),
            get: obfuscate,
        },
        type: {
            type: String,
            required: true,
            enum: PaymentMethodEnum,
        },
    },
    {
        timestamps: true,
        toJSON: {
            getters: true,
            virtuals: true,
        },
    }
);

const PaymentMethod = mongoose.model('paymentMethod', paymentMethodSchema);
export default PaymentMethod;
