const axios = require("axios");
let step = 1;
let amount;
let phone;
let myFunc;
exports.PayMe = async (req, res, next) => {
  const { message, phone_number } = req.body;
  if (
    message?.toLowerCase() === "payment" &&
    /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(phone_number) &&
    step === 1
  ) {
    phone = phone_number;
    try {
      const userRequest = await axios.post(
        "https://sellbackend.creditclan.com/parent/index.php/globalrequest/get_payment__order",
        { phone: phone_number }
      );
      if (userRequest.status === false) {
        return res.status(200).json({
          message: "There are no request payment for this number",
        });
      } else if (userRequest.status) {
        let user_phone = userRequest.data.order.find(({ phone }) => phone);
        amount = user_phone.amount;
        step = 2;
        return res.status(200).json({
          message: `Welcome! This service allows to fulfil a payment to a merchant. \n We have found  payment request for you. \n *amount*: ${userRequest.data.order[0].amount} \n *merchant*: ${userRequest.data.order[0].merchantName} \n *desc*: ${userRequest.data.order[0].description} \n  \n kindly enter  *[1]* To Make Payment \n *[2]* To Decline`,
        });
      } else {
        return res
          .status(500)
          .json({ message: "error occur,please try again" });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else if (Number(message) === 1 && step === 2) {
    generateAccountDetail = async () => {
      try {
        const result = await axios.post(
          "https://wema.creditclan.com/generate/account",
          {
            merchant_name: "E Stores",
            amount,
            narration: "PES 2021",
            phone,
          }
        );
        if (result) {
          step = 3;
          return res.status(200).json({
            message: `Kindly make a payment of ${result.data.data.amount} to the account below \n *account No* : ${result.data.data.account_number} \n *bank* : ${result.data.data.bank_name} \n \n kindly enter *[1]* to confirm your payment`,
          });
        }
      } catch (error) {
        return res.status(500).json({ message: "error occur" });
      }
    };
    myFunc = generateAccountDetail;
    myFunc();
  } else if (Number(message) === 2 && step === 2) {
    step = 1;
    return res
      .status(200)
      .json({ message: "Your request has rejected successfully" });
  } else if (Number(message) === 1 && step === 3) {
    try {
      const verify_payment = await axios.post(
        "https://wema.creditclan.com/api/v3/wema/verify_transaction",
        {
          merchant_name: "E Stores",
          amount,
          narration: "PES 2021",
          transaction_reference: "CC_kESfRVAdZyWc3qiTnmFxPYUBX8hK7tG4",
        }
      );
      if (verify_payment.data.status) {
        step = 1;
        return res
          .status(200)
          .json({ message: "Thank you, we have received your payment" });
      } else if (!verify_payment.data.status) {
        myFunc();
        return res
          .status(200)
          .json({ message: "We have not received your payment,try again" });
      } else {
        return res.status(500).json({ message: "an error occur" });
      }
    } catch (error) {
      return res.status(500).json({ message: "error occur" });
    }
  } else {
    return res
      .status(500)
      .json({ message: "Invalid value,kindly enter correct value" });
  }
};
