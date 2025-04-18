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

detectBreakpoint.init();

//
//  Web components
//  _____________________________________________

require('./components/component-template');
require('./components/variant-selector');
require('./components/component-accordion');
require('./components/product-card');
//require('./components/upsell-product-card');