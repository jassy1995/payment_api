const UserDetail = require("../models/user");
const axios = require("axios");

//clear user document
ClearUserDetail = async () => {
  await UserDetail.deleteMany();
};
let step = 1;
exports.PayMe = async (req, res, next) => {
  const { message } = req.body;
  let response;
  try {
    if (message.toLowerCase() === "payment" && step === 1) {
      response =
        "Welcome! This service allows to fulfil a payment to a merchant ,kindly enter your phone to proceed";
      return res.status(200).json({ message: response, status: "success" });
    } else if (message.match(/\d/g).length >= 11 && message.match(/[0-9]/)) {
      try {
        const userRequest = await axios.post(
          "https://sellbackend.creditclan.com/parent/index.php/globalrequest/get_payment__order",
          { phone: message }
        );
        if (userRequest.data.message === "No record found") {
          response = "There are no payment for you";
          return res.status(200).json({ message: response, status: "success" });
        } else {
          let user_phone = userRequest.data.order.find(({ phone }) => phone);
          let current_user = new UserDetail({
            amount: user_phone.amount,
            phone_number: user_phone.phone,
            process: "incomplete",
          });
          await current_user.save();
          step = 2;
          response = "We have found the following payment request";
          return res.status(200).json({
            message: response,
            data: userRequest.data.order,
            response: "kindly enter 1 or 2 to select your option",
            option: ["To Make Payment", "Decline"],
          });
        }
      } catch (error) {
        return res.status(500).json({ message: error, status: "fail" });
      }
    } else if (Number(message) === 1 && step === 2) {
      generateAccountDetail = async () => {
        try {
          let user_info = await UserDetail.find();
          const result = await axios.post(
            "https://wema.creditclan.com/generate/account",
            {
              merchant_name: "E Stores",
              amount: user_info[0].amount,
              narration: "PES 2021",
              phone: user_info[0].phone_number,
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
      ClearUserDetail();
      return res.status(200).json({ message: response, status: "success" });
    } else if (Number(message) === 1 && step === 3) {
      try {
        let user_amount_collector = await UserDetail.find();
        const verify_payment = await axios.post(
          "https://wema.creditclan.com/api/v3/wema/verify_transaction",
          {
            merchant_name: "E Stores",
            amount: user_amount_collector[0].amount,
            narration: "PES 2021",
            transaction_reference: "CC_kESfRVAdZyWc3qiTnmFxPYUBX8hK7tG4",
          }
        );
        if (verify_payment.data.status) {
          response = "Thank you, we have received your payment";
          step = 1;
          ClearUserDetail();
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
  } catch (error) {
    return res.status(500).json({ message: error, status: "server error" });
  }
};
