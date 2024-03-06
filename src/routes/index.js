// routes
var dashboardRoutes = require('./dashboard');
var promotionRoutes = require('./promotion');
var menuRoutes = require('./mainMenu');
var settingMenuRoutes = require('./settingMenu');
var notificationSettingsRoutes = require('./notificationSetting');
var listTypeRoutes = require('./listType');
var productNotAvailableRoutes = require('./productNotAvailable');
var restaurantRoutes = require('./restaurant');
var restaurantTimingRoutes = require('./restaurantTiming');
var restaurantPaymentMethodRoutes = require('./restaurantPaymentMethod');
var restaurantFoodMenuRoutes = require('./restaurantFoodMenu');
var restaurantFoodMenuProductRoutes = require('./restaurantFoodMenuProduct');
var restaurantFoodMenuProductVariationRoutes = require('./restaurantFoodMenuProductVariation');
// var restaurantFoodMenuProductAddOnRoutes = require('./restaurantFoodMenuProductAddOn');
var foodTypeRoutes = require('./foodType');
var userNotificationSettingsRoutes = require('./userNotificationSetting');
var userSettingsRoutes = require('./userSetting');
var dashboardCardRoutes = require('./dashboardCard');
var bannerRoutes = require('./banner');
var topDealRoutes = require('./topDeal');
var favoriteRoutes = require('./favourite');
var fileRoutes = require('./file');

//SPRINT 3 

var cartRoutes = require('./cart');
var orderStatusRoutes = require('./orderStatus');
var orderRoutes = require('./order');
var reviewRoutes = require('./review');
var productType = require('./productType.routes');
var reorderRoutes = require('./reorder');

var internalRoutes = require('./internal');

var appOrderRoutes = require('./app/appOrder');
var restaurantReportRoutes = require('./app/restaurantReport');
// var onboardingRoutes = require('./app/onboarding');

var bookingRoutes = require('./booking');
var bookingAppRoutes = require('./app/booking.app');

var contactLessSuggestionRoutes = require('./contactLessSuggestion');
var supportRelatedReasonRoutes = require('./supportRelatedReason');


var authMiddleware = require('../app/Middleware/auth')

module.exports = function (app) {

	//Internal Routes
	app.use('/internal', internalRoutes);

	//App Routes
	app.use('/app/mainMenu', authMiddleware, menuRoutes);
	app.use('/app/order', authMiddleware, appOrderRoutes);
	app.use('/app/report', authMiddleware, restaurantReportRoutes);
	app.use('/app/booking', authMiddleware, bookingAppRoutes);

	app.use('/dashboard', authMiddleware, dashboardRoutes);
	app.use('/promotion', authMiddleware, promotionRoutes);
	app.use('/mainMenu', authMiddleware, menuRoutes);
	app.use('/settingMenu', authMiddleware, settingMenuRoutes);
	app.use('/notificationSettings', authMiddleware, notificationSettingsRoutes);
	app.use('/userNotificationSettings', authMiddleware, userNotificationSettingsRoutes);
	app.use('/userSettings', authMiddleware, userSettingsRoutes);
	app.use('/dashboardCard', authMiddleware, dashboardCardRoutes);
	app.use('/banner', authMiddleware, bannerRoutes);
	app.use('/topDeal', authMiddleware, topDealRoutes);
	app.use('/favourite', authMiddleware, favoriteRoutes);
	app.use('/file', authMiddleware, fileRoutes);
	app.use('/food/type', authMiddleware, foodTypeRoutes);
	app.use('/food/menu', authMiddleware, restaurantFoodMenuRoutes);
	app.use('/food/menu/product', authMiddleware, restaurantFoodMenuProductRoutes);
	app.use('/food/menu/product/variation', authMiddleware, restaurantFoodMenuProductVariationRoutes);
	// app.use('/food/menu/product/addOn', authMiddleware, restaurantFoodMenuProductAddOnRoutes);
	app.use('/list/type', authMiddleware, listTypeRoutes);
	app.use('/productType', authMiddleware, productType);
	app.use('/list/productNotAvailable', authMiddleware, productNotAvailableRoutes);
	app.use('/timing', authMiddleware, restaurantTimingRoutes);
	app.use('/paymentMethod', authMiddleware, restaurantPaymentMethodRoutes);
	app.use('/cart', authMiddleware, cartRoutes);
	app.use('/order/status', authMiddleware, orderStatusRoutes);
	app.use('/order', authMiddleware, orderRoutes);
	app.use('/reorder', authMiddleware, reorderRoutes);
	app.use('/review', authMiddleware, reviewRoutes);
	app.use('/booking', authMiddleware, bookingRoutes);
	app.use('/contactLessSuggestion', authMiddleware, contactLessSuggestionRoutes);
	app.use('/supportRelatedReason', authMiddleware, supportRelatedReasonRoutes);



	
	app.use('/', authMiddleware, restaurantRoutes);
}