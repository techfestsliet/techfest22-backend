const Stripe = require("stripe")(process.env.TEMP_STRIPE_PRV_KEY_LIVE);
const User = require("../models/user");

exports.payUser = async (req, res, next) => {
  const uId = req.userId;
  const userSubscriptionPrice = req.body.price;
  const priceId =
    userSubscriptionPrice === 299
      ? process.env.PRICE_PRODUCT_SILVER_LIVE
      : process.env.PRICE_PRODUCT_GOLD_LIVE;
  // return console.log(priceId);

  try {
    const sessionStripe = await Stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          // TODO: replace this with the `price` of the product you want to sell
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: uId,
      },
      success_url: `${process.env.API_URL_BK}/pay/success/?uId=${uId}`,
      cancel_url: `${process.env.API_URL_BK}/pay/fail/?uId=${uId}`,
    });
    let userUpdate = await User.findOneAndUpdate(
      { _id: uId },
      {
        paymentDetails: {
          paymentId: sessionStripe.id,
          subscriptionType: userSubscriptionPrice,
          paymentStatus: "Ongoing",
        },
      }
    );
    // return console.log(sessionStripe);
    res.status(200).json({ url: sessionStripe.url, isError: false });
    // return console.log(checkIfAlreadyPaid, sessionStripe.url);
  } catch (e) {
    res.status(208).json({ isError: true, message: e });
  }
};

exports.successPay = async (req, res) => {
  const uId = req.query.uId;
  const getPaymentId = await User.findById({ _id: uId });
  if (!getPaymentId) {
    return res.redirect(
      `${process.env.LIVE_FRONTEND_URL}/user/pay/?paystatus=false`
    );
  }
  if (!getPaymentId.paymentDetails.paymentId) {
    return res.send("Some Error Accured");
  }
  const checkIfPaid = await Stripe.checkout.sessions.retrieve(
    getPaymentId.paymentDetails.paymentId
  );
  // return console.log(checkIfPaid);
  if (!checkIfPaid) {
    return res.send("Some Error Accured");
  }

  if (checkIfPaid.payment_status === "unpaid") {
    return res.send("Some Error Accured");
  }

  if (checkIfPaid.payment_status != "unpaid") {
    let userUpdate = await User.findOneAndUpdate(
      { _id: uId },
      {
        hasPaidEntry: true,
        paymentDetails: {
          paymentStatus: checkIfPaid.payment_status,
          isSuccess: true,
          paymentId: checkIfPaid.id,
          paymentIntent: checkIfPaid.payment_intent,
          subscriptionType: getPaymentId.paymentDetails.subscriptionType,
          payUserDetail: checkIfPaid.customer_details,
        },
      }
    );
  }
  res.render("successpay");
};

exports.failPay = (req, res) => {
  res.render("failedpay");
};

exports.failPpay = (req, res) => {
  res.render("failedpay");
};
exports.sucPay = (req, res) => {
  res.render("successpay");
};

exports.hasPaymendSuccess = async (req, res, next) => {
  const uId = req.userId;
  const getPaymentUser = await User.findById({ _id: uId });
  // const userMailDomain = getPaymentUser.email.split("@")
  if (
    !(getPaymentUser.hasPaidEntry && getPaymentUser.paymentDetails.isSuccess)
  ) {
    return res.status(208).json({
      payError: true,
      title: "Not Paid",
      message: "You have to pay first!",
    });
  }
  // const checkIfPaid = await Stripe.checkout.sessions.retrieve(
  //   getPaymentUser.paymentDetails.paymentId
  // );
  // if (!checkIfPaid) {
  //   return res
  //     .status(208)
  //     .json({ payError: true, message: "Some Error Accured" });
  // }

  // if (checkIfPaid.payment_status == "unpaid") {
  //   return res.status(208).json({
  //     payError: true,
  //     title: "Not Paid",
  //     message: "You have to pay first!",
  //   });
  // }

  next();
};
