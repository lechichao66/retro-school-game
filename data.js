// ==========================================
// 少年江湖 - 稳定三文件版 数据中心 (data.js)
// Phase 1 Step 1: 兼容层，数据由 src/data/*.js 预加载
// ==========================================

const __DATA = window.__JH_DATA__ || {};

const onlinePlayers = __DATA.onlinePlayers || [];
const equipData = __DATA.equipData || {};
const equipQualityConfig = __DATA.equipQualityConfig || {};
const shopItems = __DATA.shopItems || [];
const marketItems = __DATA.marketItems || [];
const sectList = __DATA.sectList || [];
const martialArtsBySect = __DATA.martialArtsBySect || {};
const jobList = __DATA.jobList || [];
const tradeRoutes = __DATA.tradeRoutes || { defaultRouteId: "novice_loop", routes: [] };
const taskTypeEnum = __DATA.taskTypeEnum || {};
const taskTypeList = __DATA.taskTypeList || [];
const taskTemplates = __DATA.taskTemplates || [];
const monsterList = __DATA.monsterList || [];
const mapData = __DATA.mapData || {};
const dropTable = __DATA.dropTable || {};
const injuryTypes = __DATA.injuryTypes || [];
const recipes = __DATA.recipes || [];
const itemData = __DATA.itemData || {};
