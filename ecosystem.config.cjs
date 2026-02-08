module.exports = {
  apps: [
    {
      name: "url-shortner-deploy",
      script: "index.js",
      env: {
        PORT: 4000,
        BASE_URL: "http://localhost:4000"
      }
    }
  ]
};
