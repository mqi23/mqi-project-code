// routes/plan.route.js
const express = require("express");
const router = express.Router();
const { getPlans, getPlanById, purchase, getAvailableStock ,getSoldStockCount , getallavailableplans 
  , getplanstocksummary , insertStockBatch
} = require("../controllers/planController");
const clientAuth = require("../middleware/clientAuth");

router.get("/", async (req, res) => {
  try {
    const results = await getPlans();
    res.send(results);
  } catch (error) {
    console.log(error);
     res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});

router.get("/available", async (req, res) => {
  try {
    const results = await getAvailableStock();
    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  } 
});

router.get("/sold", async (req, res) => {
  try {
    const results = await getSoldStockCount();
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "خطأ في جلب عدد البطاقات المباعة." });
  } 
});

router.get("/allplans", async (req, res) => {
  try {
    const results = await getallavailableplans();
    res.send(results);
  } catch (error) {
    console.log(error);
     res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});

router.get("/:id/stock", async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const results = await getplanstocksummary(planId);
    if (!results) {
      return res.status(404).send({ message: "Plan not found" });
    }
    res.send(results);
  } catch (error) {
    console.log(error);
     res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const results = await getPlanById(planId);
    res.send(results);
  } catch (error) {
   res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});

router.post("/purchase", clientAuth, async (req, res) => {
  try {
    const clientId = parseInt(req.user.id);
    const planId = parseInt(req.body.planId);
    const results = await purchase(planId, clientId);
    if (!results.success) {
       return res.status(501).send({ message: results.message });
    }
    res.send(results);
  } catch (error) {
    console.log(error)
     res.status(500).send({ message: "اكو مشكله بالدنيا..." });
  }
});

router.post("/stock/batch", async (req, res) => {
    try {
        const { planId, codes } = req.body;
        
        if (!planId || !codes || !Array.isArray(codes)) {
            return res.status(400).send({ message: "Invalid input: planId and codes array are required." });
        }
        
        const results = await insertStockBatch(parseInt(planId), codes);

        if (!results.success) {
            return res.status(404).send({ message: results.message });
        }
        
        res.status(201).send({ inserted: results.inserted });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "اكو مشكله بالدنيا..." });
    }
});




module.exports = router;
