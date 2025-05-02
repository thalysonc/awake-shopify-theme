//
//  API
//  _____________________________________________

import product from './api/product';
import cart from './api/cart';

product.init();
cart.init();

//
//  Utils
//  _____________________________________________

import detectBreakpoint from "./utils/detect-breakpoint";
import money from "./utils/money";
import escape from "./utils/escape";

detectBreakpoint.init();
money.init();
escape.init();

//
//  Libs
//  _____________________________________________

window.focusTrap = require('./libs/focus-trap');

//
//  Web components
//  _____________________________________________

require('./components/component-template');
require('./components/variant-selector');
require('./components/addtocart-button');
require('./components/component-accordion');
require('./components/product-card');
//require('./components/upsell-product-card');
require('./components/product-form');
require('./components/variant-picker');
require('./components/side-drawer');