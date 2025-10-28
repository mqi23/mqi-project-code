const express = require("express");
const router = express.Router();
const { getClientInvoices } = require("../controllers/invoiceController");
const clientAuth = require("../middleware/clientAuth");

router.get("/client/:id", async (req, res) => {
    try {
        const clientId = parseInt(req.params.id);

        if (isNaN(clientId)) {
             return res.status(400).send({ message: "Invalid client ID" });
        }

        const results = await getClientInvoices(clientId);

        if (!results.success) {
            return res.status(404).send({ message: results.message });
        }
        
        res.send(results.invoices);
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "اكو مشكله بالدنيا..." });
    }
});

module.exports = router;
