const UserDetail = require("../models/user");
const axios = require("axios");
let step = 1;
let amount;
let phone;
exports.PayMe = async (req, res, next) => {
  const { message, phone_number } = req.body;
  let response;
  if (
    message.toLowerCase() === "payment" &&
    /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(phone_number) &&
    step === 1
  ) {
    phone = phone_number;
    response =
      "Welcome! This service allows to fulfil a payment to a merchant.";
    try {
      const userRequest = await axios.post(
        "https://sellbackend.creditclan.com/parent/index.php/globalrequest/get_payment__order",
        { phone: phone_number }
      );
      if (userRequest.data.message === "No record found") {
        return res.status(200).json({
          message: "There are no request payment for this number",
          status: "success",
        });
      } else {
        let user_phone = userRequest.data.order.find(({ phone }) => phone);
        amount = user_phone.amount;
        step = 2;
        return res.status(200).json({
          message: response,
          notes: "We have found the following payment request",
          data: userRequest.data.order,
          response: "kindly enter 1 or 2 to select your option",
          option: ["To Make Payment", "Decline"],
        });
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
          response = `Kindly make a payment of ${result.data.data.amount} to the ${result.data.data.account_number} account number,${result.data.data.bank_name}`;
          return res.status(200).json({
            message: response,
            status: "success",
            response: "kindly enter 1 to confirm your payment",
          });
        }
      } catch (error) {
        return res.status(500).json({ message: error, status: "failed" });
      }
    };
    generateAccountDetail();
  } else if (Number(message) === 2 && step === 2) {
    response = "Your request has successfully rejected";
    step = 1;
    return res.status(200).json({ message: response, status: "success" });
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
        response = "Thank you, we have received your payment";
        step = 1;
        return res.status(200).json({ message: response, status: "success" });
      } else if (!verify_payment.data.status) {
        response = "We have not received your payment";
        this.generateAccountDetail();
        return res.status(200).json({ message: response, status: "success" });
      }
    } catch (error) {
      return res.status(500).json({ message: error, status: "failed" });
    }
  } else {
    response = "Invalid value,kindly enter correct value";
    return res.status(500).json({ message: response, status: "failed" });
  }
};
