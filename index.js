const express = require("express");
const dotenv = require("dotenv");
const { default: Shopify } = require("@shopify/shopify-api");

dotenv.config();

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOP, SHOPIFY_API_SCOPES, HOST } =
  process.env;

const host = "127.0.0.1";
const port = 3000;

const shops = {};

console.log("shops", shops);

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SHOPIFY_API_SCOPES,
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: false,
  // This should be replaced with your preferred storage strategy
  //   SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const app = express();

app.get("/", async (req, res) => {
  if (typeof shops[req.query.shop] !== "undefined") {
    res.send("Hello world");
  } else {
    res.redirect(`/auth?shop=${req.query.shop}`);
  }
});

app.get("/auth", async (req, res) => {
  const authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    "/auth/callback",
    false
  );

  console.log("authRoute", authRoute);

  res.redirect(authRoute);
});

app.get("/auth/callback", async (req, res) => {
  const shopSession = await Shopify.Auth.validateAuthCallback(
    req,
    res,
    req.query
  );

  console.log("shopSession", shopSession);

  shops[shopSession.shop] = shopSession;

  res.redirect(`https://${HOST}`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
