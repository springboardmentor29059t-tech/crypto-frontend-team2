"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_1 = require("../data/mockData");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({ items: mockData_1.holdings });
});
exports.default = router;
