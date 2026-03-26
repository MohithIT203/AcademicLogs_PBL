const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { getSettings, toggleEditPermission, updateGeneralSettings } = require("../controllers/admin.settings.controller");

router.get("/admin/settings", protect, getSettings);
router.patch("/admin/settings/edit-permission", protect, toggleEditPermission);
router.patch("/admin/settings/general", protect, updateGeneralSettings);

module.exports = router;