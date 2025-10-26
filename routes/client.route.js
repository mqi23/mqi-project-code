// routes/client.route.js
const express = require("express");
const router = express.Router();
const { register, login , getBalance } = require("../controllers/clientController");

router.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const isSaved = await register(body);
    if (!isSaved) {
      return res.status(501).send({ message: "اكو مشكله بالدنيا..." });
    }
    res.send({ message: "Register succefully." });
  } catch (error) {
    res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body;
    const result = await login(body.phone, body.password);
    if (!result.success) {
      return res.status(501).send({ message: result.message });
    }
    res.send({ token: result.token });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});
router.get("/:id/balance", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const result = await getBalance(clientId);
    if (!result.success) {
      return res.status(404).send({ message: result.message });
    }
    res.send(result.client);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
}); 

module.exports = router;
